import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getOrCreateSession, updateSessionStep, setSessionTemplate, clearSession } from "@/src/lib/whatsapp/session-manager";
import { createServerSupabase } from "@/src/lib/supabase-server";
import { initiateMpesaPayment, checkTransactionStatus } from "@/src/utils/debito";
import { generateAndDeliverPDF, sendWhatsAppText } from "@/src/lib/whatsapp/pdf-delivery";

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.META_APP_SECRET;

/**
 * Valida a assinatura HMAC SHA-256 enviada pela Meta no header x-hub-signature-256.
 */
function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!APP_SECRET || !signature) return false;
  const expectedSignature = "sha256=" + createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
  return expectedSignature === signature;
}

/**
 * Verificação do Webhook pela Meta (GET)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

/**
 * Recebimento de Mensagens (POST)
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // Validar assinatura da Meta (produção)
    if (APP_SECRET) {
      const signature = request.headers.get("x-hub-signature-256");
      if (!verifySignature(rawBody, signature)) {
        console.warn("[WhatsApp Webhook] Assinatura inválida — rejeitado.");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    // Validar estrutura básica da Meta
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) return NextResponse.json({ status: "ignored" });

    // Ignorar mensagens que não são texto (imagens, áudio, stickers, etc.)
    if (message.type !== "text" || !message.text?.body?.trim()) {
      return NextResponse.json({ status: "ignored_non_text" });
    }

    console.log("[WhatsApp Webhook] Mensagem recebida de:", message.from);
    
    // Executar lógica de negócio de forma assíncrona
    handleBotLogic(message.from, message.text.body.trim());

    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("[WhatsApp Hub Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Lógica principal do bot separada para execução assíncrona
 */
async function handleBotLogic(from: string, text: string) {
  try {
    const supabase = await createServerSupabase();

    // 1. Identificar ou criar sessão do usuário
    const session = await getOrCreateSession(from);
    if (!session) return;

    // 2. Lógica de Seleção de Template (Se o usuário enviou um slug ou primeira interação)
    if (!session.current_template_id) {
      // Tentar encontrar template pelo texto enviado (slug)
      const { data: template } = await supabase
        .from("templates")
        .select("id, title, form_schema")
        .eq("slug", (text || "").toLowerCase())
        .maybeSingle();

      if (template) {
        console.log("[WhatsApp Webhook] Template encontrado:", template.title);
        await setSessionTemplate(session.id, template.id);
        const schema = template.form_schema as any;
        const firstField = schema?.[0]?.fields?.[0];

        if (firstField) {
          await sendWhatsAppMessage(from, `Ótimo! Vamos começar a preencher: ${template.title}.\n\nPergunta 1: ${firstField.label}`);
        }
      } else {
        await sendWhatsAppMessage(from, "Olá! Bem-vindo ao DOKU. Para começar, digite o código (slug) do documento que deseja gerar.\n\nExemplo: 'bilhete-identidade'");
      }
      return;
    }

    // 3. Processar resposta de um passo ativo
    const { data: template, error: tFetchError } = await supabase
      .from("templates")
      .select("id, title, form_schema, price")
      .eq("id", session.current_template_id)
      .single();

    if (tFetchError || !template) {
      await sendWhatsAppMessage(from, "Desculpe, não conseguimos recuperar os dados do documento selecionado. Digite o código novamente.");
      await clearSession(session.id);
      return;
    }

    const sections = (template.form_schema as any) || [];
    const allFields = sections.flatMap((s: any) => s.fields);
    const currentIndex = session.current_step_index;
    const currentField = allFields[currentIndex];

    if (currentField) {
      const updatedData = { [currentField.id]: text };
      const nextIndex = currentIndex + 1;

      if (nextIndex < allFields.length) {
        const nextField = allFields[nextIndex];
        await updateSessionStep(session.id, updatedData, nextIndex);
        await sendWhatsAppMessage(from, `Pergunta ${nextIndex + 1}: ${nextField.label}`);
      } else {
        await updateSessionStep(session.id, updatedData, nextIndex);
        
        const priceValue = parseFloat(template.price.toString().replace(/[^0-9.]/g, '')) || 0;
        
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: session.profile_id,
            doc_template_id: template.id,
            status: "pending",
            amount: priceValue,
            metadata: { 
              source: "whatsapp",
              whatsapp_phone: from,
              form_data: { ...session.form_data, ...updatedData }
            }
          })
          .select()
          .single();

        if (orderError) throw orderError;

        try {
          // Débito API espera msisdn com 9 dígitos (sem prefixo 258)
          const msisdn = from.startsWith('258') ? from.slice(3) : from;
          const callback_url = `${process.env.NEXTAUTH_URL}/api/payments/webhook`;
          
          const paymentResult = await initiateMpesaPayment({
            msisdn,
            amount: priceValue,
            reference_description: `DOKU - ${template.title}`,
            internal_notes: `Order-ID: ${order.id} | WhatsApp: ${from}`,
            callback_url
          });

          // Guardar debito_reference na order para match no callback
          const debitoRef = paymentResult.debito_reference;
          await supabase
            .from("orders")
            .update({
              metadata: {
                ...order.metadata,
                debito_reference: debitoRef
              }
            })
            .eq("id", order.id);

          console.log(`[WhatsApp Payment] Iniciado: User=${msisdn}, Order=${order.id}, Ref=${debitoRef}, Callback=${callback_url}`);

          await sendWhatsAppMessage(from, `Tudo pronto! Seu documento "${template.title}" foi configurado.\n\nPreço: ${template.price}\n\nEnviamos agora o pedido de pagamento M-Pesa para o seu telemóvel (${msisdn}). Por favor, confirme com o seu PIN para receber o seu documento aqui mesmo.`);
          
          // Limpar sessão após pagamento iniciado
          await clearSession(session.id);

          // Polling de status como fallback (caso o callback da Débito não chegue)
          pollPaymentAndDeliver(
            order.id,
            debitoRef,
            template.id,
            { ...session.form_data, ...updatedData },
            from,
            session.profile_id
          );
        } catch (paymentError: any) {
          console.error("[WhatsApp Payment Error]:", paymentError);
          await sendWhatsAppMessage(from, `Houve um erro ao solicitar o pagamento. Por favor, tente novamente digitando o código do documento.`);
          await clearSession(session.id);
        }
      }
    }
  } catch (error) {
    console.error("[WhatsApp Logic Exception]:", error);
  }
}

/**
 * Polling de fallback: verifica o status do pagamento periodicamente.
 * Caso a Débito não envie o callback, este mecanismo garante a entrega do PDF.
 */
async function pollPaymentAndDeliver(
  orderId: string,
  debitoRef: string,
  templateId: string,
  formData: Record<string, any>,
  whatsappPhone: string,
  userId?: string | null,
) {
  // Intervalos de verificação: 20s, 40s, 60s, 90s, 120s
  const delays = [20000, 40000, 60000, 90000, 120000];

  for (const delay of delays) {
    await new Promise(r => setTimeout(r, delay));

    try {
      // Verificar se o callback já processou (order não está mais pending)
      const supabase = (await import("@supabase/supabase-js")).createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: order } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

      if (order?.status !== "pending") {
        console.log(`[Polling] Order ${orderId} já processada (${order?.status}). Parando.`);
        return;
      }

      // Verificar status na Débito API
      const result = await checkTransactionStatus(debitoRef);
      const status = result.status?.toUpperCase();
      console.log(`[Polling] Order ${orderId} status: ${status}`);

      const isSuccess = ["SUCCESS", "SUCCESSFUL", "SETTLED", "COMPLETED"].includes(status);
      const isFailed = ["FAILED", "CANCELLED"].includes(status);

      if (isSuccess) {
        await supabase
          .from("orders")
          .update({ status: "paid", mpesa_ref: debitoRef })
          .eq("id", orderId);

        console.log(`[Polling] Pagamento confirmado via polling. Gerando PDF...`);
        await generateAndDeliverPDF(orderId, templateId, formData, whatsappPhone, userId);
        return;
      }

      if (isFailed) {
        await supabase
          .from("orders")
          .update({ status: "failed" })
          .eq("id", orderId);
        await sendWhatsAppText(whatsappPhone,
          'Infelizmente o pagamento não foi confirmado. Envie "ola" para tentar novamente.');
        return;
      }
    } catch (pollError) {
      console.error(`[Polling] Erro ao verificar status:`, pollError);
    }
  }

  console.log(`[Polling] Timeout para order ${orderId}. Nenhuma confirmação recebida.`);
}

/**
 * Helper para enviar mensagens via Meta Cloud API
 */
async function sendWhatsAppMessage(to: string, text: string) {
  try {
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      console.error("WhatsApp API config missing");
      return;
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: { body: text },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("[WhatsApp Send Error Details]:", JSON.stringify(err, null, 2));
    }
  } catch (error) {
    console.error("[WhatsApp Send Exception]:", error);
  }
}
