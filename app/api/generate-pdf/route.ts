
import { NextResponse } from 'next/server';
import { generatePDFServer } from '@/src/utils/pdfGeneratorServer';
import { createServerSupabase } from '@/src/lib/supabase-server';
import { checkTransactionStatus } from '@/src/utils/debito';

export async function POST(request: Request) {
  try {
    const { templateId, userData, paymentReference, title } = await request.json();

    if (!templateId || !userData) {
      return NextResponse.json({ error: 'Dados incompletos para gerar PDF' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    
    // 1. Verificar o template e o preço
    const { data: template, error: tError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (tError || !template) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    // Limpar o preço para garantir uma comparação numérica correta
    const cleanPrice = template.price 
      ? Number(template.price.toString().replace(/[^\d.]/g, '')) 
      : 0;

    const isFree = cleanPrice === 0;

    // 2. Se for pago, verificar o status do pagamento
    if (!isFree) {
      if (!paymentReference) {
        return NextResponse.json({ error: 'Referência de pagamento necessária para este modelo' }, { status: 402 });
      }

      // Verificar status na API de pagamentos
      const paymentStatus = await checkTransactionStatus(paymentReference);
      
      if (paymentStatus.status !== 'SUCCESS') {
        return NextResponse.json({ 
          error: 'Pagamento não confirmado', 
          status: paymentStatus.status 
        }, { status: 402 });
      }
    }

    // 3. Gerar o PDF no servidor
    const pdfBuffer = await generatePDFServer(
      { ...userData, title: title || template.title, titulo: title || template.title }, 
      template.content, 
      title || template.title
    );

    // 4. Incrementar contador de uso de forma assíncrona (não bloqueia a resposta)
    supabase
      .from('templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', templateId)
      .then(({ error }) => {
        if (error) console.error('Erro ao incrementar contador de uso:', error);
      });

    // 5. Retornar o PDF como stream/blob
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="DOKU_${(title || template.title).replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Erro na geração de PDF no servidor:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar PDF' }, { status: 500 });
  }
}
