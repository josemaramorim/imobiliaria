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
    include: {
      tags: true,
      interactions: {
        orderBy: { date: 'desc' }
      }
    },
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
    // if tags were sent, connect them to the lead
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagIds = tags.map((t: any) => t.id).filter(Boolean);
      if (tagIds.length > 0) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { tags: { connect: tagIds.map((tagId: string) => ({ id: tagId })) } }
        });
      }
    }
    // Return lead with tags
    const createdLead = await prisma.lead.findUnique({
      where: { id: lead.id },
      include: { tags: true, interactions: { orderBy: { date: 'desc' } } }
    });
    return res.status(201).json({ lead: createdLead });
  } catch (err: any) {
    console.error('create lead err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.put('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('lead'), async (req: any, res: any) => {
  const id = req.params.id;
  const partial = req.body;
  try {
    const { tags, ...updateData } = partial;
    const forbidden = ['id', 'tenantId', 'createdAt', 'updatedAt', 'interactions', 'opportunities'];
    forbidden.forEach(key => delete updateData[key]);

    // Update lead basic fields
    const lead = await prisma.lead.update({ where: { id }, data: updateData });

    // Update tags if provided
    if (tags !== undefined) {
      // Disconnect all existing tags first
      await prisma.lead.update({
        where: { id },
        data: { tags: { set: [] } }
      });

      // Connect new tags
      if (Array.isArray(tags) && tags.length > 0) {
        const tagIds = tags.map((t: any) => t.id).filter(Boolean);
        if (tagIds.length > 0) {
          await prisma.lead.update({
            where: { id },
            data: { tags: { connect: tagIds.map((tagId: string) => ({ id: tagId })) } }
          });
        }
      }
    }

    // Return lead with tags
    const updatedLead = await prisma.lead.findUnique({
      where: { id },
      include: { tags: true, interactions: { orderBy: { date: 'desc' } } }
    });
    return res.json({ lead: updatedLead });
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