import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateAndDeliverPDF, sendWhatsAppText } from "@/src/lib/whatsapp/pdf-delivery";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function getSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Webhook de confirmação de pagamento (Débito API / M-Pesa).
 * A Débito chama esta rota quando o status da transação muda.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Payment Webhook] Evento recebido:", JSON.stringify(body));

    const debitoRef = body.debito_reference || body.reference;
    const rawStatus = (body.status || "").toString().toUpperCase();

    if (!debitoRef || !rawStatus) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const isSuccess = ["SUCCESS", "SUCCESSFUL", "SETTLED", "COMPLETED"].includes(rawStatus);
    const isFailed  = ["FAILED", "CANCELLED"].includes(rawStatus);

    if (!isSuccess && !isFailed) {
      console.log("[Payment Webhook] Status intermediário ignorado:", rawStatus);
      return NextResponse.json({ status: "ignored" });
    }

    const supabase = getSupabase();

    // 1. Encontrar order pela debito_reference guardada no metadata
    const { data: orders } = await supabase
      .from("orders")
      .select("id, status, metadata, doc_template_id, user_id")
      .eq("status", "pending")
      .filter("metadata->>source", "eq", "whatsapp");

    // Match principal: debito_reference guardada na order
    let matchedOrder = orders?.find(
      (o: any) => o.metadata?.debito_reference === debitoRef
    );

    // Fallback: procurar pelo Order-ID nas internal_notes do callback
    if (!matchedOrder && body.internal_notes) {
      matchedOrder = orders?.find(
        (o: any) => o.id && body.internal_notes.includes(o.id)
      );
    }

    if (!matchedOrder) {
      console.warn("[Payment Webhook] Order não encontrada para:", debitoRef);
      return NextResponse.json({ status: "order_not_found" });
    }

    const whatsappPhone = matchedOrder.metadata?.whatsapp_phone;
    const formData = matchedOrder.metadata?.form_data;

    if (isSuccess) {
      // Marcar como paid
      await supabase
        .from("orders")
        .update({ status: "paid", mpesa_ref: debitoRef })
        .eq("id", matchedOrder.id);

      console.log("[Payment Webhook] Pagamento confirmado. Gerando PDF para order:", matchedOrder.id);

      // Gerar e enviar PDF
      if (whatsappPhone && matchedOrder.doc_template_id && formData) {
        await generateAndDeliverPDF(
          matchedOrder.id,
          matchedOrder.doc_template_id,
          formData,
          whatsappPhone,
          matchedOrder.user_id
        );
      } else {
        console.warn("[Payment Webhook] Dados incompletos para PDF:", {
          whatsappPhone: !!whatsappPhone,
          templateId: !!matchedOrder.doc_template_id,
          formData: !!formData,
        });
        if (whatsappPhone) {
          await sendWhatsAppText(whatsappPhone,
            "Pagamento confirmado! Obrigado por usar o DOKU. Contacte o suporte para receber o seu documento.");
        }
      }
    } else if (isFailed) {
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", matchedOrder.id);

      if (whatsappPhone) {
        await sendWhatsAppText(whatsappPhone,
          'Infelizmente o pagamento não foi confirmado. Envie "ola" para tentar novamente.');
      }
      console.log("[Payment Webhook] Pagamento falhado para order:", matchedOrder.id);
    }

    return NextResponse.json({ status: "processed" });
  } catch (error) {
    console.error("[Payment Webhook Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
