
import { NextResponse } from 'next/server';
import { initiateMpesaPayment } from '@/src/utils/debito';
import { createServerSupabase } from '@/src/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { phoneNumber, templateId, description } = await request.json();

    if (!phoneNumber || !templateId) {
      return NextResponse.json(
        { error: 'Telefone e ID do modelo são obrigatórios.' },
        { status: 400 }
      );
    }

    // Buscar o preço real no banco de dados para evitar manipulação no client-side
    const supabase = await createServerSupabase();
    const { data: template, error: dbError } = await supabase
      .from('templates')
      .select('price')
      .eq('id', templateId)
      .single();

    if (dbError || !template) {
      console.error('Database error fetching price:', dbError);
      return NextResponse.json(
        { error: 'Não foi possível validar o preço do documento.' },
        { status: 500 }
      );
    }

    // Limpar e validar o preço numericamente
    const amount = template.price 
      ? Number(template.price.toString().replace(/[^\d.]/g, '')) 
      : 0;
    
    // Se o documento for grátis, não devia estar a chamar esta rota,
    // mas por segurança validamos aqui também.
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Este documento é gratuito e não requer pagamento.' },
        { status: 400 }
      );
    }

    // Formatar número para garantir exatamente 9 dígitos (ex: 841234567)
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('258') && cleanPhone.length > 9) {
      cleanPhone = cleanPhone.substring(3);
    }
    
    // Se ainda tiver mais de 9 dígitos por engano (ex: 00258...), pegar apenas os últimos 9
    if (cleanPhone.length > 9) {
      cleanPhone = cleanPhone.slice(-9);
    }

    const result = await initiateMpesaPayment({
      msisdn: cleanPhone,
      amount: Number(amount),
      // M-Pesa reference must be between 1 and 20 chars
      reference_description: (description || 'Doku').replace(/[^a-zA-Z0-9]/g, '').substring(0, 15), 
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('M-Pesa payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento M-Pesa' },
      { status: 500 }
    );
  }
}
