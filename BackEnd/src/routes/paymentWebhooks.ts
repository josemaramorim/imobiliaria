import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { t } from '../i18n';

const router = Router();

// Generic webhook receiver for payment gateway events (Asaas)
router.post('/payments', async (req: Request, res: Response) => {
  // Asaas usually sends JSON with 'event' and 'payment' or 'id' and 'status'
  const payload: any = req.body;
  console.log('[webhook] payments payload', payload);

  try {
    // Try to extract some useful identifiers
    const payment = payload.payment || payload.data || payload;
    const externalReference = payment?.externalReference || payment?.externalReferenceId || payment?.external_id || payment?.reference;
    const asaasId = payment?.id || payment?.paymentId || payload?.id;
    const status = (payment?.status || payment?.paymentStatus || payload?.status || '').toString().toUpperCase();

    // Find invoice by gatewayExternalId or externalReference
    let invoice = null;
    if (asaasId) invoice = await prisma.invoice.findFirst({ where: { gatewayExternalId: asaasId } });
    if (!invoice && externalReference) invoice = await prisma.invoice.findUnique({ where: { id: externalReference } });

    if (!invoice) {
      console.warn('[webhook] invoice not found for payment', asaasId || externalReference);
      return res.status(204).send('no_invoice');
    }

    // Map statuses - basic heuristics
    let newStatus: any = invoice.status;
    if (status.includes('PAID') || status === 'CONFIRMED') newStatus = 'PAID';
    else if (status.includes('OVERDUE') || status.includes('LATE')) newStatus = 'OVERDUE';
    else newStatus = 'PENDING';

    await prisma.invoice.update({ where: { id: invoice.id }, data: { status: newStatus, gatewayData: { ...(invoice.gatewayData as any), lastWebhook: payload }, paidDate: newStatus === 'PAID' ? new Date() : invoice.paidDate } });

    console.log(`[webhook] invoice ${invoice.id} updated to ${newStatus}`);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[webhook] error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
