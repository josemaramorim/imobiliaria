import { Router } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /auth/register - register a user (SaaS owner/seed only)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'missing_fields' });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'user_exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash: hash } });
  return res.json({ id: user.id, name: user.name, email: user.email });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'invalid_credentials' });
  const payload: any = { sub: user.id, role: user.role };
  if (user.tenantId) payload.tenantId = user.tenantId;
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev', { expiresIn: '8h' });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId } });
});

export default router;
