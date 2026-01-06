import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { pdfBase64, email, docTitle } = await request.json();

    if (!pdfBase64 || !email) {
      return NextResponse.json({ error: 'Dados insuficientes para o envio' }, { status: 400 });
    }

    // Remover o prefixo data:application/pdf;base64, se existir
    const base64Content = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    
    // Converter para Buffer para garantir o anexo correto no Resend
    const buffer = Buffer.from(base64Content, 'base64');

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
