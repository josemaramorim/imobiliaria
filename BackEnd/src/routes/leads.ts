import { Router } from 'express';
import prisma from '../prisma';
import { leadSchema } from '../validators/schemas';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';
import { requireOwnership } from '../middleware/ownership';

const router = Router();

router.get('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const tenantId = res.locals.tenantId;
  const leads = await prisma.lead.findMany({
    where: { tenantId },
    include: { tags: true },
    orderBy: { createdAt: 'desc' }
  });
  return res.json({ leads });
});

router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'validation', details: parsed.error.format() });
  const { tags, ...leadData } = parsed.data;
  try {
    const lead = await prisma.lead.create({ data: { ...leadData, tenantId: res.locals.tenantId } });
    // if tags were sent, create or connect them
    if (tags && tags.length > 0) {
      for (const t of tags) {
        const existing = await prisma.tag.findFirst({ where: { label: t.label, tenantId: res.locals.tenantId } });
        if (!existing) {
          await prisma.tag.create({ data: { label: t.label, color: t.color, tenantId: res.locals.tenantId } });
        }
      }
    }
    return res.status(201).json({ lead });
  } catch (err: any) {
    console.error('create lead err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.put('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('lead'), async (req: any, res: any) => {
  const id = req.params.id;
  const partial = req.body;
  try {
    const lead = await prisma.lead.update({ where: { id }, data: partial });
    return res.json({ lead });
  } catch (err: any) {
    console.error('update lead err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.delete('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('lead'), async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.lead.delete({ where: { id } });
    return res.json({ deleted: true });
  } catch (err: any) {
    console.error('delete lead err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;