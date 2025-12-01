import { Router } from 'express';
import prisma from '../prisma';
import { tenantCreateSchema, tenantUpdateSchema } from '../validators/schemas';
import { t } from '../i18n';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /tenants - list tenants (SaaS admin only)
router.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const tenants = await prisma.tenant.findMany({ include: { subscriptionPlan: true } });
  return res.json({ tenants });
});

// POST /tenants - create tenant
router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parse = tenantCreateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'validation', details: parse.error.format(), message: t(req, 'common.required_field_error') });
  const { name, domain, themeColor, logoUrl, planId, paymentGatewayId, trialDuration } = parse.data;
  try {
    const tnt = await prisma.tenant.create({ data: {
      name, domain, themeColor: themeColor || '#4f46e5', logoUrl, planId, paymentGatewayId,
      trialEndsAt: trialDuration && trialDuration > 0 ? new Date(Date.now() + trialDuration * 24 * 60 * 60 * 1000) : null,
      nextBillingDate: trialDuration === 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
    } });
    return res.status(201).json({ message: t(req, 'tenant.created'), tenant: tnt });
  } catch (err: any) {
    console.error('create tenant err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

// GET /tenants/:id
router.get('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const id = req.params.id;
  const tenant = await prisma.tenant.findUnique({ where: { id }, include: { subscriptionPlan: true } });
  if (!tenant) return res.status(404).json({ error: 'not_found', message: t(req, 'common.not_found') });
  return res.json({ tenant });
});

// PUT /tenants/:id
router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const id = req.params.id;
  const parse = tenantUpdateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'validation', details: parse.error.format() });
  try {
    const tnt = await prisma.tenant.update({ where: { id }, data: parse.data });
    return res.json({ message: t(req, 'tenant.updated'), tenant: tnt });
  } catch (err: any) {
    console.error('update tenant err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

// DELETE /tenants/:id
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.tenant.delete({ where: { id } });
    return res.json({ message: t(req, 'tenant.deleted') });
  } catch (err: any) {
    console.error('delete tenant err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;
