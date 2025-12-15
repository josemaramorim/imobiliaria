import { Router } from 'express';
import prisma from '../prisma';
import { leadSchema } from '../validators/schemas';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';
import { requireOwnership } from '../middleware/ownership';

const router = Router();

router.get('/', requireAuth, identifyTenant, requireTenant, async (_req: any, res: any) => {
  const tenantId = res.locals.tenantId;
  const leads = await prisma.lead.findMany({
    where: { tenantId },
    include: {
      leadTags: { include: { tag: true } },
      interactions: {
        orderBy: { date: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const leadsWithTags = leads.map((lead: any) => ({
    ...lead,
    tags: lead.leadTags.map((lt: any) => lt.tag)
  }));

  return res.json({ leads: leadsWithTags });
});

router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  console.log('🧾 [LEADS][CREATE] body.customValues:', req.body?.customValues);
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'validation', details: parsed.error.format() });
  const { tags, ...leadData } = parsed.data;
  try {
    const lead = await prisma.lead.create({ data: { ...leadData, tenantId: res.locals.tenantId } });
    console.log('🧾 [LEADS][CREATE] saved.customValues:', lead.customValues);
    // if tags were sent, link them via join table
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagIds = tags.map((t: any) => t.id).filter(Boolean);
      if (tagIds.length > 0) {
        await prisma.leadTag.createMany({
          data: tagIds.map((tagId: string) => ({ leadId: lead.id, tagId })),
          skipDuplicates: true,
        });
      }
    }
    // Return lead with tags
    const createdLead = await prisma.lead.findUnique({
      where: { id: lead.id },
      include: { leadTags: { include: { tag: true } }, interactions: { orderBy: { date: 'desc' } } }
    });
    const leadWithTags = createdLead ? { ...createdLead, tags: createdLead.leadTags.map((lt: any) => lt.tag) } : null;
    return res.status(201).json({ lead: leadWithTags });
  } catch (err: any) {
    console.error('create lead err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.put('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('lead'), async (req: any, res: any) => {
  const id = req.params.id;
  const partial = req.body;
  console.log('🧾 [LEADS][UPDATE] body.customValues:', partial?.customValues);
  try {
    const { tags, ...updateData } = partial;
    const forbidden = ['id', 'tenantId', 'createdAt', 'updatedAt', 'interactions', 'opportunities', 'leadTags'];
    forbidden.forEach(key => delete updateData[key]);

    // Update lead basic fields
    const lead = await prisma.lead.update({ where: { id }, data: updateData });
    console.log('🧾 [LEADS][UPDATE] saved.customValues:', lead.customValues);

    // Update tags if provided
    if (tags !== undefined) {
      // Remove existing links
      await prisma.leadTag.deleteMany({ where: { leadId: id } });

      // Connect new tags
      if (Array.isArray(tags) && tags.length > 0) {
        const tagIds = tags.map((t: any) => t.id).filter(Boolean);
        if (tagIds.length > 0) {
          await prisma.leadTag.createMany({
            data: tagIds.map((tagId: string) => ({ leadId: id, tagId })),
            skipDuplicates: true,
          });
        }
      }
    }

    // Return lead with tags
    const updatedLead = await prisma.lead.findUnique({
      where: { id },
      include: { leadTags: { include: { tag: true } }, interactions: { orderBy: { date: 'desc' } } }
    });
    const leadWithTags = updatedLead ? { ...updatedLead, tags: updatedLead.leadTags.map((lt: any) => lt.tag) } : null;
    return res.json({ lead: leadWithTags });
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