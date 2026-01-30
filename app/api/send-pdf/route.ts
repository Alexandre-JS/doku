import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { generatePDFServer } from '@/src/utils/pdfGeneratorServer';
import { createServerSupabase } from '@/src/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined');
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const { templateId, userData, email, docTitle, layoutType } = await request.json();

    if (!templateId || !userData || !email) {
      return NextResponse.json({ error: 'Dados insuficientes para o envio' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: template, error: tError } = await supabase
      .from('templates')
      .select('content')
      .eq('id', templateId)
      .single();

    if (tError || !template) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    // Gerar o PDF no servidor (retorna arraybuffer)
    const pdfArrayBuffer = await generatePDFServer(userData, template.content, docTitle, layoutType);
    const buffer = Buffer.from(pdfArrayBuffer);

    const { data, error } = await resend.emails.send({
      from: 'DOKU Docs <onboarding@resend.dev>',
      to: [email],
      subject: `Seu documento DOKU: ${docTitle}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #143361;">
          <h2 style="color: #00A86B;">Seu documento está aqui!</h2>
          <p>Olá,</p>
          <p>Conforme solicitado, enviamos em anexo a cópia digital do seu documento: <strong>${docTitle}</strong>.</p>
          <p>Este documento foi gerado através da plataforma DOKU Moçambique.</p>
          <br />
          <p>Se você tiver qualquer dúvida, entre em contato conosco através do WhatsApp.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">© ${new Date().getFullYear()} DOKU - Documentos Oficiais.</p>
        </div>
      `,
      attachments: [
        {
          filename: `${docTitle.replace(/\s+/g, '_')}.pdf`,
          content: buffer,
        },
      ],
    });

    if (error) {
      console.error('Erro ao enviar e-mail:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro no servidor ao enviar PDF:', error);
    return NextResponse.json({ error: 'Falha no servidor ao processar o envio' }, { status: 500 });
  }
}
