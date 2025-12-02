import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { visitSchema } from '../validators/schemas';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';
import { requireOwnership } from '../middleware/ownership';
import { t } from '../i18n';

const router = Router();

router.get('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const tenantId = res.locals.tenantId;
  const items = await prisma.visit.findMany({ where: { tenantId } });
  return res.json({ visits: items });
});

router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const parsed = visitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'validation', details: parsed.error.format() });
  try {
    const visit = await prisma.visit.create({ data: { ...parsed.data as any, tenantId: res.locals.tenantId } });
    return res.status(201).json({ message: t(req, 'visit.created'), visit });
  } catch (err: any) {
    console.error('create visit err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.put('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('visit'), async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const visit = await prisma.visit.update({ where: { id }, data: req.body });
    return res.json({ message: t(req, 'visit.updated'), visit });
  } catch (err: any) {
    console.error('update visit err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.delete('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('visit'), async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await prisma.visit.delete({ where: { id } });
    return res.json({ message: t(req, 'visit.deleted') });
  } catch (err: any) {
    console.error('delete visit err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;
