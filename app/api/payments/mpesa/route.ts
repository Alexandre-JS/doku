
import { NextResponse } from 'next/server';
import { initiateMpesaPayment } from '@/src/utils/debito';

export async function POST(request: Request) {
  try {
    const { phoneNumber, amount, description } = await request.json();

    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Telefone e valor são obrigatórios.' },
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
