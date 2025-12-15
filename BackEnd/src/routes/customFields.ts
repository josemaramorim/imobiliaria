import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { customFieldBulkUpsertSchema, customFieldEntitySchema, customFieldConfigSchema } from '../validators/schemas';

const router = Router();

router.get('/:entity', requireAuth, async (req: any, res) => {
  const entityParam = String(req.params.entity || '').toUpperCase();
  const entityParse = customFieldEntitySchema.safeParse(entityParam);
  if (!entityParse.success) {
    return res.status(400).json({ error: 'invalid_entity' });
  }

  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.user?.sub } });
    if (!currentUser) {
      return res.status(401).json({ error: 'unauthenticated' });
    }

    const tenantHeader = req.headers['x-tenant-id'];
    const headerTenantId = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;
    const tenantId = currentUser.tenantId || headerTenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenant_required' });
    }

    const fields = await prisma.customFieldConfig.findMany({
      where: { tenantId, entity: entityParse.data as any },
      orderBy: { key: 'asc' },
    });

    return res.json({ fields });
  } catch (error) {
    console.error('Error listing custom fields:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

router.put('/:entity', requireAuth, async (req: any, res) => {
  const entityParam = String(req.params.entity || '').toUpperCase();
  const entityParse = customFieldEntitySchema.safeParse(entityParam);
  if (!entityParse.success) {
    return res.status(400).json({ error: 'invalid_entity' });
  }

  const parse = customFieldBulkUpsertSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'validation', details: parse.error.format() });
  }

  const { fields } = parse.data;

  for (const field of fields) {
    const typeCheck = customFieldConfigSchema.pick({ type: true }).safeParse({ type: field.type });
    if (!typeCheck.success) {
      return res.status(400).json({ error: 'invalid_type' });
    }
    if ((field.type === 'SELECT' || field.type === 'MULTI_SELECT') && (!field.options || field.options.length === 0)) {
      return res.status(400).json({ error: 'options_required', key: field.key });
    }
  }

  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.user?.sub } });
    if (!currentUser) {
      return res.status(401).json({ error: 'unauthenticated' });
    }

    const tenantHeader = req.headers['x-tenant-id'];
    const headerTenantId = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;
    const tenantId = currentUser.tenantId || headerTenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenant_required' });
    }
    if (currentUser.tenantId && currentUser.role !== 'ADMIN') {
      return res.status(403).json({ error: 'forbidden' });
    }

    const entity = entityParse.data as any;

    await prisma.$transaction([
      prisma.customFieldConfig.deleteMany({ where: { tenantId, entity } }),
      prisma.customFieldConfig.createMany({
        data: fields.map((field) => ({
          key: field.key,
          label: field.label,
          type: field.type as any,
          options: field.options ?? [],
          required: field.required ?? false,
          tenantId,
          entity,
        })),
        skipDuplicates: true,
      }),
    ]);

    const refreshed = await prisma.customFieldConfig.findMany({
      where: { tenantId, entity },
      orderBy: { key: 'asc' },
    });

    return res.json({ fields: refreshed });
  } catch (error) {
    console.error('Error updating custom fields:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

export default router;
