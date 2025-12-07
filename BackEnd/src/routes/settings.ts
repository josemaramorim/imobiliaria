import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { globalSettingsSchema } from '../validators/schemas';

const router = Router();

router.get('/global', requireAuth, requireRole('ADMIN'), async (req: any, res) => {
  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.user?.sub } });
    if (!currentUser || currentUser.tenantId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const settings = await prisma.globalSettings.findFirst();
    if (!settings) {
      return res.status(404).json({ error: 'not_found' });
    }

    return res.json({ settings });
  } catch (error) {
    console.error('Error fetching global settings:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

router.put('/global', requireAuth, requireRole('ADMIN'), async (req: any, res) => {
  const parse = globalSettingsSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'validation', details: parse.error.format() });
  }

  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.user?.sub } });
    if (!currentUser || currentUser.tenantId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const existing = await prisma.globalSettings.findFirst();
    let settings;
    if (existing) {
      settings = await prisma.globalSettings.update({ where: { id: existing.id }, data: parse.data });
    } else {
      settings = await prisma.globalSettings.create({ data: parse.data });
    }

    return res.json({ settings });
  } catch (error) {
    console.error('Error updating global settings:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

export default router;
