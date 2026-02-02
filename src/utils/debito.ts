
const DEBITO_API_URL = process.env.DEBITO_API_URL || 'https://my.debito.co.mz/api/v1';
const DEBITO_API_TOKEN = process.env.DEBITO_API_TOKEN;

// Helper to ensure config is present
const ensureConfig = () => {
  if (!DEBITO_API_TOKEN) {
    throw new Error('DEBITO_API_TOKEN is not configured in environment variables');
  }
};

export interface DebitoMpesaRequest {
  msisdn: string;
  amount: number;
  reference_description: string;
  internal_notes?: string;
  callback_url?: string;
}

export interface DebitoResponse {
  message: string;
  debito_reference: string;
  status: 'PENDING' | 'SUCCESS' | 'SUCCESSFUL' | 'SETTLED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transaction_id: number;
  provider_reference?: string | null;
  provider_response_code?: string | null;
}

export async function initiateMpesaPayment(data: DebitoMpesaRequest): Promise<DebitoResponse> {
  ensureConfig();
  const walletId = process.env.DEBITO_MPESA_WALLET_ID;
  
  if (!walletId) {
    throw new Error('DEBITO_MPESA_WALLET_ID is not configured');
  }

  const response = await fetch(`${DEBITO_API_URL}/wallets/${walletId}/c2b/mpesa`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEBITO_API_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error initiating M-Pesa payment');
  }

  return result;
}

export async function checkTransactionStatus(debitoReference: string): Promise<DebitoResponse> {
  ensureConfig();
  const response = await fetch(`${DEBITO_API_URL}/transactions/${debitoReference}/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${DEBITO_API_TOKEN}`,
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error checking transaction status');
  }

  return result;
}
