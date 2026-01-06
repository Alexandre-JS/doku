import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined');
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const { suggestion, reaction } = await request.json();

    if (!suggestion) {
      return NextResponse.json({ error: 'Sugestão é obrigatória' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [process.env.ADMIN_EMAIL || 'info@dokumoz.com'],
      subject: 'Nova Sugestão de Modelo - DOKU',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #143361;">
          <h2 style="color: #00A86B;">Nova Sugestão Recebida!</h2>
          <p><strong>Feedback:</strong> ${reaction || 'Não informado'}</p>
          <p><strong>Sugestão:</strong></p>
          <div style="background-color: #f4f7f9; padding: 15px; border-radius: 8px; border-left: 4px solid #00A86B;">
            ${suggestion}
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">Este é um e-mail automático enviado pelo sistema DOKU.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Erro detalhado do Resend:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao enviar sugestão' }, { status: 500 });
  }
}
