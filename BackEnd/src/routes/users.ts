import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import bcrypt from 'bcrypt';

const router = Router();

// GET /users/me
router.get('/me', requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true, tenantId: true } });
  if (!user) return res.status(404).json({ error: 'not_found' });
  return res.json({ user });
});

// GET /users - List all users in tenant
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.sub;
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    // List all users in the same tenant
    const users = await prisma.user.findMany({
      where: { tenantId: currentUser.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatarUrl: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { name: 'asc' }
    });

    return res.json({ users });
  } catch (error) {
    console.error('Error listing users:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// POST /users - Create new user
router.post('/', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.sub;
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    // Only ADMIN or SUPER_ADMIN can create users
    if (!['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const { name, email, phone, role, status } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'email_already_exists' });
    }

    // Generate default password hash (user should change on first login)
    const defaultPassword = '123456';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role || 'BROKER',
        status: status || 'ACTIVE',
        passwordHash,
        tenantId: currentUser.tenantId,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatarUrl: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// PUT /users/:id - Update user
router.put('/:id', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.sub;
    const targetUserId = req.params.id;
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    // Only ADMIN or SUPER_ADMIN can update other users, or user can update themselves
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);
    if (!isAdmin && userId !== targetUserId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const { name, email, phone, role, status } = req.body;

    // Check if target user exists and is in same tenant
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return res.status(404).json({ error: 'target_user_not_found' });
    }

    if (targetUser.tenantId !== currentUser.tenantId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    // If email is being changed, check if new email already exists
    if (email && email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'email_already_exists' });
      }
    }

    // Users cannot change their own role
    const updateData: any = {
      name: name || targetUser.name,
      email: email || targetUser.email,
      phone: phone !== undefined ? phone : targetUser.phone,
    };

    // Only ADMIN or SUPER_ADMIN can change role and status
    if (isAdmin) {
      if (role) updateData.role = role;
      if (status) updateData.status = status;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatarUrl: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// DELETE /users/:id - Delete user
router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.sub;
    const targetUserId = req.params.id;
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    // Only ADMIN can delete users
    if (currentUser.role !== 'ADMIN') {
      return res.status(403).json({ error: 'forbidden' });
    }

    // Users cannot delete themselves
    if (userId === targetUserId) {
      return res.status(400).json({ error: 'cannot_delete_self' });
    }

    // Check if target user exists and is in same tenant
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return res.status(404).json({ error: 'target_user_not_found' });
    }

    if (targetUser.tenantId !== currentUser.tenantId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    // Delete user
    await prisma.user.delete({ where: { id: targetUserId } });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

export default router;
