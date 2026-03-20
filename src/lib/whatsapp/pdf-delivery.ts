import { createClient } from "@supabase/supabase-js";
import { generatePDFServer } from "../../utils/pdfGeneratorServer";

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const getBackgroundSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  if (!supabaseUrl) {
    console.warn("[PDF Delivery] Supabase URL is missing in the current context.");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Gera o PDF a partir do template + form_data, faz upload ao Supabase Storage
 * e envia o documento ao utilizador via WhatsApp.
 */
export async function generateAndDeliverPDF(
  orderId: string,
  templateId: string,
  formData: Record<string, any>,
  whatsappPhone: string,
  userId?: string | null
) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const supabase = getBackgroundSupabase();

  // 1. Buscar template (conteúdo HTML)
  const { data: template, error: tError } = await supabase
    .from("templates")
    .select("id, title, content, slug")
    .eq("id", templateId)
    .single();

  if (tError || !template) {
    console.error("[PDF Delivery] Template não encontrado:", templateId, tError);
    await sendWhatsAppText(whatsappPhone,
      "Pagamento confirmado, mas houve um erro ao localizar o modelo do documento. Contacte o suporte.");
    return;
  }

  console.log("[PDF Delivery] Gerando PDF:", template.title, "para", whatsappPhone);

  // 2. Gerar PDF
  const pdfBuffer = await generatePDFServer(
    { ...formData, title: template.title, titulo: template.title },
    template.content,
    template.title
  );

  const buffer = Buffer.from(pdfBuffer);
  const safeSlug = template.slug.replace(/[^a-z0-9_-]/gi, '_');
  const fileName = `whatsapp/${orderId}_${safeSlug}.pdf`;

  // 3. Upload ao Supabase Storage (bucket "documents")
  let uploadOk = false;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(fileName, buffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    console.warn("[PDF Delivery] Primeiro upload falhou, tentando criar bucket:", uploadError.message);
    await supabase.storage.createBucket("documents", { public: true });
    const { error: retryError } = await supabase.storage
      .from("documents")
      .upload(fileName, buffer, { contentType: "application/pdf", upsert: true });
    if (retryError) {
      console.error("[PDF Delivery] Upload falhou definitivamente:", retryError);
    } else {
      uploadOk = true;
    }
  } else {
    uploadOk = true;
  }

  // 4. Obter URL do PDF (Usamos link assinado porque o bucket é privado)
  let pdfUrl: string | null = null;
  if (uploadOk) {
    // Gerar um link que expira em 1 hora para o WhatsApp baixar o arquivo
    const { data: signData, error: signError } = await supabase.storage
      .from("documents")
      .createSignedUrl(fileName, 3600);
    
    if (signError) {
      console.error("[PDF Delivery] Erro ao gerar link assinado:", signError);
    } else {
      pdfUrl = signData?.signedUrl ?? null;
    }
  }

  // 5. Registar em user_documents
  await supabase.from("user_documents").insert({
    user_id: userId || null,
    order_id: orderId,
    template_id: templateId,
    file_path: fileName,
    document_name: `DOKU_${template.title.replace(/\s+/g, '_')}.pdf`,
    title: template.title,
  });

  // 6. Enviar ao utilizador via WhatsApp
  if (pdfUrl) {
    await sendWhatsAppText(whatsappPhone,
      `✅ Pagamento confirmado!\n\nO seu documento "${template.title}" foi gerado com sucesso.`);
    await sendWhatsAppDocument(
      whatsappPhone,
      pdfUrl,
      `DOKU_${template.title.replace(/\s+/g, '_')}.pdf`,
      template.title
    );
  } else {
    await sendWhatsAppText(whatsappPhone,
      "Pagamento confirmado! Houve um problema técnico ao enviar o PDF. Contacte o suporte para receber o documento.");
  }

  // 7. Marcar order como delivered
  await supabase
    .from("orders")
    .update({ status: "delivered" })
    .eq("id", orderId);

  console.log("[PDF Delivery] Concluído para order:", orderId);
}

/**
 * Envia mensagem de texto via WhatsApp Cloud API.
 */
export async function sendWhatsAppText(to: string, text: string) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error("[WhatsApp] Config missing: WHATSAPP_TOKEN ou PHONE_NUMBER_ID");
    return;
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text },
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      console.error("[WhatsApp Text Send Error]:", JSON.stringify(err));
    }
  } catch (e) {
    console.error("[WhatsApp Text Send Exception]:", e);
  }
}

/**
 * Envia um documento PDF via WhatsApp Cloud API.
 */
async function sendWhatsAppDocument(to: string, url: string, filename: string, caption: string) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) return;

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "document",
        document: {
          link: url,
          filename,
          caption: `Seu documento: ${caption}`,
        },
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      console.error("[WhatsApp Document Send Error]:", JSON.stringify(err));
    }
  } catch (e) {
    console.error("[WhatsApp Document Send Exception]:", e);
  }
}
