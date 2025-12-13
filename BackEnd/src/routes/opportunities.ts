import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { opportunitySchema } from '../validators/schemas';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';
import { requireOwnership } from '../middleware/ownership';
import { t } from '../i18n';

const router = Router();

router.get('/', requireAuth, identifyTenant, requireTenant, async (_req: any, res: any) => {
  const tenantId = res.locals.tenantId;
  const items = await prisma.opportunity.findMany({
    where: { tenantId },
    include: { opportunityTags: { include: { tag: true } } }
  });

  const opportunities = items.map((opp: any) => ({
    ...opp,
    tags: opp.opportunityTags.map((ot: any) => ot.tag)
  }));

  return res.json({ opportunities });
});

router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const parsed = opportunitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'validation', details: parsed.error.format() });
  try {
    const { tags, ...data } = parsed.data as any;
    const tenantId = res.locals.tenantId;

    // Build allowed payload to avoid passing unexpected fields to Prisma
    const allowed: any = {};
    if (data.leadId !== undefined) allowed.leadId = data.leadId;
    if (data.leadName !== undefined) allowed.leadName = data.leadName;
    if (data.propertyId !== undefined && data.propertyId !== null) allowed.propertyId = data.propertyId;
    if (data.value !== undefined) allowed.value = data.value;
    if (data.probability !== undefined) allowed.probability = data.probability;
    if (data.stage !== undefined) allowed.stage = data.stage;
    allowed.tenantId = tenantId;

    const opp = await prisma.opportunity.create({ data: allowed });

    if (tags && tags.length > 0) {
      const tagIds: string[] = [];
      for (const tag of tags) {
        const existing = await prisma.tag.findFirst({ where: { label: tag.label, tenantId } });
        let tagId = existing?.id;
        if (!tagId) {
          const created = await prisma.tag.create({ data: { label: tag.label, color: tag.color || '#3B82F6', tenantId } });
          tagId = created.id;
        }
        if (tagId) tagIds.push(tagId);
      }

      if (tagIds.length > 0) {
        await prisma.opportunityTag.createMany({
          data: tagIds.map((tagId) => ({ opportunityId: opp.id, tagId })),
          skipDuplicates: true,
        });
      }
    }

    const result = await prisma.opportunity.findUnique({
      where: { id: opp.id },
      include: { opportunityTags: { include: { tag: true } } }
    });
    const opportunityWithTags = result ? { ...result, tags: result.opportunityTags.map((ot: any) => ot.tag) } : null;
    return res.status(201).json({ message: t(req, 'opportunity.created'), opportunity: opportunityWithTags });
  } catch (err: any) {
    console.error('create opportunity err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.put('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('opportunity'), async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    // sanitize incoming payload to avoid passing nested arrays/unsupported fields
    const { tags, opportunityTags, ...data } = req.body as any;

    const allowed: any = {};
    if (data.leadId !== undefined) allowed.leadId = data.leadId;
    if (data.leadName !== undefined) allowed.leadName = data.leadName;
    // propertyId can be explicitly set to null to clear relation
    if ('propertyId' in data) allowed.propertyId = data.propertyId;
    if (data.value !== undefined) allowed.value = data.value;
    if (data.probability !== undefined) allowed.probability = data.probability;
    if (data.stage !== undefined) allowed.stage = data.stage;

    const updated = await prisma.opportunity.update({ where: { id }, data: allowed });

    // Handle tags mapping if provided
    if (Array.isArray(tags)) {
      const tenantId = res.locals.tenantId;
      // Resolve or create tags, collect tagIds
      const tagIds: string[] = [];
      for (const tag of tags) {
        const existing = await prisma.tag.findFirst({ where: { label: tag.label, tenantId } });
        let tagId = existing?.id;
        if (!tagId) {
          const created = await prisma.tag.create({ data: { label: tag.label, color: tag.color || '#3B82F6', tenantId } });
          tagId = created.id;
        }
        if (tagId) tagIds.push(tagId);
      }

      // Replace opportunity tags
      await prisma.opportunityTag.deleteMany({ where: { opportunityId: id } });
      if (tagIds.length > 0) {
        await prisma.opportunityTag.createMany({ data: tagIds.map(tagId => ({ opportunityId: id, tagId })), skipDuplicates: true });
      }
    }

    const result = await prisma.opportunity.findUnique({ where: { id }, include: { opportunityTags: { include: { tag: true } } } });
    const oppWithTags = result ? { ...result, tags: result.opportunityTags.map((ot: any) => ot.tag) } : null;
    return res.json({ message: t(req, 'opportunity.updated'), opportunity: oppWithTags });
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
