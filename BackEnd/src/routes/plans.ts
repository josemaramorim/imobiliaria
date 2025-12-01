import { Router } from 'express';
import prisma from '../prisma';
import { planSchema } from '../validators/schemas';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  const plans = await prisma.subscriptionPlan.findMany();
  return res.json({ plans });
});

router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = planSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'validation', details: parsed.error.format() });
  const { name, price, billingCycle, features } = parsed.data;
  try {
    const plan = await prisma.subscriptionPlan.create({ data: { name, price, billingCycle, features: features || [] } });
    return res.status(201).json({ plan });
  } catch (err: any) {
    console.error('create plan err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;