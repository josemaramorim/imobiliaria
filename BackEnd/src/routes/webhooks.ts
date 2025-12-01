import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { webhookSchema } from '../validators/schemas';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';
import { t } from '../i18n';

const router = Router();

function generateSecret() {
  return `whsec_${Math.random().toString(36).substring(2, 32)}`;
}

router.get('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const tenantId = res.locals.tenantId;
  const items = await prisma.webhook.findMany({ where: { tenantId } });
  return res.json({ webhooks: items });
});

router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const parsed = webhookSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'validation', details: parsed.error.format() });
  try {
    const secret = generateSecret();
    const wh = await prisma.webhook.create({ data: { ...parsed.data as any, secret, tenantId: res.locals.tenantId } });
    return res.status(201).json({ message: t(req, 'webhook.created'), webhook: wh });
  } catch (err: any) {
    console.error('create webhook err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await prisma.webhook.delete({ where: { id } });
    return res.json({ message: t(req, 'webhook.deleted') });
  } catch (err: any) {
    console.error('delete webhook err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;