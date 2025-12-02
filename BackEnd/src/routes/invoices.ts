import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { invoiceSchema } from '../validators/schemas';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';
import { requireOwnership } from '../middleware/ownership';
import { t } from '../i18n';

const router = Router();

router.get('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const tenantId = res.locals.tenantId;
  const items = await prisma.invoice.findMany({ where: { tenantId } });
  return res.json({ invoices: items });
});

router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const parsed = invoiceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'validation', details: parsed.error.format() });
  try {
    const inv = await prisma.invoice.create({ data: { ...parsed.data as any, tenantId: res.locals.tenantId } });
    return res.status(201).json({ message: t(req, 'invoice.created'), invoice: inv });
  } catch (err: any) {
    console.error('create invoice err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.post('/:id/mark-paid', requireAuth, identifyTenant, requireTenant, requireOwnership('invoice'), async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const inv = await prisma.invoice.update({ where: { id }, data: { status: 'PAID', paidDate: new Date() } });
    return res.json({ message: t(req, 'invoice.marked_paid'), invoice: inv });
  } catch (err: any) {
    console.error('mark paid err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;
