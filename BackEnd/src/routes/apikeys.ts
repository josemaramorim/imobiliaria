import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { apiKeySchema } from '../validators/schemas';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';
import { t } from '../i18n';

const router = Router();

function generateToken() {
  return `ap_live_${Math.random().toString(36).substr(2, 24)}`;
}

router.get('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const tenantId = res.locals.tenantId;
  const items = await prisma.apiKey.findMany({ where: { tenantId } });
  return res.json({ apikeys: items });
});

router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const parsed = apiKeySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'validation', details: parsed.error.format() });
  try {
    const token = generateToken();
    const prefix = token.substring(0, 12) + '...';
    const createData: any = { name: parsed.data.name, prefix, token, scopes: parsed.data.scopes || [], status: parsed.data.status || 'ACTIVE', tenantId: parsed.data.tenantId };
    const key = await prisma.apiKey.create({ data: { ...createData, tenantId: res.locals.tenantId } });
    return res.status(201).json({ message: t(req, 'apikey.created'), apiKey: { id: key.id, name: key.name, prefix: key.prefix, token: token } });
  } catch (err: any) {
    console.error('create apikey err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.post('/:id/revoke', requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await prisma.apiKey.update({ where: { id }, data: { status: 'INACTIVE' } });
    return res.json({ message: t(req, 'apikey.revoked') });
  } catch (err: any) {
    console.error('revoke apikey err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;