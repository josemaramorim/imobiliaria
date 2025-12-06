import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';

const router = Router();

router.get('/', requireAuth, identifyTenant, requireTenant, async (_req: any, res: any) => {
  const tenantId = res.locals.tenantId;
  const tags = await prisma.tag.findMany({ where: { tenantId }, orderBy: { label: 'asc' } });
  return res.json({ tags });
});

router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const { label, color } = req.body;
  try {
    const created = await prisma.tag.create({ data: { label, color, tenantId: res.locals.tenantId } });
    return res.status(201).json({ tag: created });
  } catch (err: any) {
    console.error('create tag err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.put('/:id', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const id = req.params.id;
  const { label, color } = req.body;
  try {
    const updated = await prisma.tag.update({ where: { id }, data: { label, color } });
    return res.json({ tag: updated });
  } catch (err: any) {
    console.error('update tag err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.delete('/:id', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const id = req.params.id;
  try {
    await prisma.tag.delete({ where: { id } });
    return res.json({ deleted: true });
  } catch (err: any) {
    console.error('delete tag err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;
