import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { invoiceSchema } from '../validators/schemas';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';
import * as asaasService from '../services/asaas';
import { t } from '../i18n';

const router = Router();

// POST /checkout - create invoice and try to create charge at Asaas sandbox
router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const parsed = invoiceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'validation', details: parsed.error.format(), message: t(req, 'common.required_field_error') });

  const tenantId = res.locals.tenantId as string;
  const { planName, amount, issueDate, dueDate } = parsed.data as any;

  try {
    const invoice = await prisma.invoice.create({ data: { tenantId, planName, amount, issueDate: new Date(issueDate), dueDate: new Date(dueDate), status: 'PENDING', gatewayProvider: 'asaas' } });

    // try create payment on Asaas
    const asaasResp = await asaasService.createAsaasPayment({ value: amount, dueDate, description: `Fatura ${invoice.id} - ${planName}`, externalReference: invoice.id });

    // update invoice with gateway info
    await prisma.invoice.update({ where: { id: invoice.id }, data: { gatewayExternalId: asaasResp.id || undefined, gatewayData: asaasResp.raw || {} } });

    return res.status(201).json({ message: t(req, 'invoice.created'), invoice: { ...invoice, gateway: asaasResp } });
  } catch (err: any) {
    console.error('checkout create err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

// GET /checkout/:invoiceId - check status and redirect info
router.get('/:id', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const id = req.params.id;
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return res.status(404).json({ error: 'not_found', message: t(req,'common.not_found') });

    if (invoice.gatewayProvider === 'asaas' && invoice.gatewayExternalId) {
      const remote = await asaasService.getAsaasPayment(invoice.gatewayExternalId);
      return res.json({ invoice, gateway: remote });
    }

    return res.json({ invoice });
  } catch (err: any) {
    console.error('checkout fetch err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;
