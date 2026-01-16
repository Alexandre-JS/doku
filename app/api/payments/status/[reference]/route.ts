
import { NextResponse } from 'next/server';
import { checkTransactionStatus } from '@/src/utils/debito';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;

    if (!reference) {
      return NextResponse.json(
        { error: 'Referência é obrigatória.' },
        { status: 400 }
      );
    }

    const result = await checkTransactionStatus(reference);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar status da transação' },
      { status: 500 }
    );
  }
}
