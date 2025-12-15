import { Router } from 'express';
import prisma from '../prisma';
import { propertySchema } from '../validators/schemas';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';
import { requireOwnership } from '../middleware/ownership';

const router = Router();

// GET /properties?tenantId=xxx
router.get('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const tenantId = res.locals.tenantId;
  const properties = await prisma.property.findMany({ where: { tenantId } });
  return res.json({ properties });
});

router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  console.log('🏠 [CREATE PROPERTY] Recebido:', req.body);
  console.log('🏠 [CREATE PROPERTY] TenantId:', res.locals.tenantId);
  console.log('🏠 [CREATE PROPERTY] User:', req.user);
  
  const parse = propertySchema.safeParse(req.body);
  if (!parse.success) {
    console.error('❌ [CREATE PROPERTY] Validação falhou:', parse.error.format());
    return res.status(400).json({ error: 'validation', details: parse.error.format() });
  }
  
  const data = parse.data;
  console.log('✅ [CREATE PROPERTY] Dados validados:', data);
  
  try {
    const prop = await prisma.property.create({ data: { ...data, tenantId: res.locals.tenantId } });
    console.log('✅ [CREATE PROPERTY] Criado com sucesso:', prop.id);
    return res.status(201).json({ property: prop });
  } catch (err: any) {
    console.error('❌ [CREATE PROPERTY] Erro ao criar:', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.put('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('property'), async (req: any, res: any) => {
  const id = req.params.id;
  const partial = req.body;
  try {
    const prop = await prisma.property.update({ where: { id }, data: partial });
    return res.json({ property: prop });
  } catch (err: any) {
    console.error('update property err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.delete('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('property'), async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.property.delete({ where: { id } });
    return res.json({ deleted: true });
  } catch (err: any) {
    console.error('delete property err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;