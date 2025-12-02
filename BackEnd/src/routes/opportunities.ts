import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { opportunitySchema } from '../validators/schemas';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';
import { requireOwnership } from '../middleware/ownership';
import { t } from '../i18n';

const router = Router();

router.get('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const tenantId = res.locals.tenantId;
  const items = await prisma.opportunity.findMany({ where: { tenantId } });
  return res.json({ opportunities: items });
});

router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const parsed = opportunitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'validation', details: parsed.error.format() });
  try {
    const { tags, ...data } = parsed.data as any;
    const opp = await prisma.opportunity.create({ data: { ...data, tenantId: res.locals.tenantId } });

    if (tags && tags.length > 0) {
      for (const tag of tags) {
        const existing = await prisma.tag.findFirst({ where: { label: tag.label, tenantId: data.tenantId } });
        let tagId = existing?.id;
        if (!tagId) {
          const created = await prisma.tag.create({ data: { label: tag.label, color: tag.color, tenantId: data.tenantId } });
          tagId = created.id;
        }
        await prisma.opportunity.update({ where: { id: opp.id }, data: { tags: { connect: { id: tagId } } } });
      }
    }

    const result = await prisma.opportunity.findUnique({ where: { id: opp.id }, include: { tags: true } });
    return res.status(201).json({ message: t(req, 'opportunity.created'), opportunity: result });
  } catch (err: any) {
    console.error('create opportunity err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.put('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('opportunity'), async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const opp = await prisma.opportunity.update({ where: { id }, data: req.body });
    return res.json({ message: t(req, 'opportunity.updated'), opportunity: opp });
  } catch (err: any) {
    console.error('update opportunity err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.delete('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('opportunity'), async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await prisma.opportunity.delete({ where: { id } });
    return res.json({ message: t(req, 'opportunity.deleted') });
  } catch (err: any) {
    console.error('delete opportunity err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;
