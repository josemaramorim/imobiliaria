// Use global fetch (Node 18+). If your Node version doesn't provide fetch, install node-fetch.

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';
const ASAAS_BASE = process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3';

if (!ASAAS_API_KEY) {
  console.warn('[Asaas] ASAAS_API_KEY is not set. Asaas operations will fail until it is provided.');
}

export type AsaasPaymentResult = {
  id?: string;
  status?: string;
  paymentUrl?: string;
  qrCode?: string;
  raw?: any;
};

function authHeaders() {
  // Asaas expects access_token either as query or Authorization/Bearer. We'll try Authorization Bearer by default.
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ASAAS_API_KEY}`,
  };
}

// Create a payment (charge) in Asaas
export async function createAsaasPayment(payload: { value: number, dueDate?: string, customerName?: string, customerEmail?: string, description?: string, externalReference?: string }): Promise<AsaasPaymentResult> {
  const url = `${ASAAS_BASE}/payments`;
  try {
    const body = {
      value: payload.value,
      dueDate: payload.dueDate, // ISO date
      description: payload.description || 'Cobrança via Apollo SaaS',
      externalReference: payload.externalReference,
      // simple payer structure Asaas accepts (if missing, provider may create anonymous)
      payer: {
        name: payload.customerName,
        email: payload.customerEmail,
      }
    };

    const res = await fetch(url, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
    const json = await res.json();
    if (!res.ok) {
      console.error('[Asaas] create charge failed', json);
      return { raw: json };
    }

    // typical Asaas responses include id and can include invoiceLink
    return {
      id: json.id || json.paymentId || json.invoiceId,
      status: (json.status || json.paymentStatus || '').toString(),
      paymentUrl: json.invoiceUrl || json.paymentUrl || json.barcodeUrl || json.url,
      qrCode: json.qrCode || json.pixQrCode || undefined,
      raw: json,
    };
  } catch (err) {
    console.error('[Asaas] error creating payment', err);
    return { raw: { error: String(err) } };
  }
}

export async function getAsaasPayment(paymentId: string): Promise<AsaasPaymentResult> {
  const url = `${ASAAS_BASE}/payments/${paymentId}`;
  try {
    const res = await fetch(url, { method: 'GET', headers: authHeaders() });
    const json = await res.json();
    if (!res.ok) return { raw: json };
    return { id: json.id, status: json.status, paymentUrl: json.invoiceUrl || json.paymentUrl, raw: json };
  } catch (err) {
    return { raw: { error: String(err) } };
  }
}
