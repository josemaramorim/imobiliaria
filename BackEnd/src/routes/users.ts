import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /users/me
router.get('/me', requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true, tenantId: true } });
  if (!user) return res.status(404).json({ error: 'not_found' });
  return res.json({ user });
});

export default router;
