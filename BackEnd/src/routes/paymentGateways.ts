import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /payment-gateways - list payment gateways (Super Admin/Admin only)
router.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const gateways = await prisma.paymentGateway.findMany({
    orderBy: { id: 'asc' }
  });
  
  // Normalizar configFields para sempre ser um array
  const normalizedGateways = gateways.map(gw => {
    let configFields: any[] = [];
    
    // Se for string, fazer parse
    if (typeof gw.configFields === 'string') {
      try {
        configFields = JSON.parse(gw.configFields);
      } catch (e) {
        console.error(`❌ Erro ao fazer parse de configFields para ${gw.id}:`, e);
        configFields = [];
      }
    } else if (Array.isArray(gw.configFields)) {
      configFields = gw.configFields;
    }
    
    return {
      ...gw,
      configFields
    };
  });
  
  return res.json({ paymentGateways: normalizedGateways });
});

// POST /payment-gateways - create new payment gateway (Super Admin/Admin only)
router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { id, name, logo, themeColor, configFields } = req.body;
  
  // Validação básica
  if (!id || !name || !logo) {
    return res.status(400).json({ error: 'ID, nome e logo são obrigatórios' });
  }
  
  // Verificar se já existe
  const existing = await prisma.paymentGateway.findUnique({ where: { id } });
  if (existing) {
    return res.status(409).json({ error: 'Já existe um gateway com este ID' });
  }
  
  const gateway = await prisma.paymentGateway.create({
    data: {
      id,
      name,
      logo,
      themeColor: themeColor || '#000000',
      status: 'INACTIVE', // Novos gateways começam inativos
      configFields: configFields || []
    }
  });
  
  return res.status(201).json({ paymentGateway: gateway });
});

// PUT /payment-gateways/:id - update payment gateway (Super Admin/Admin only)
router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { name, logo, themeColor, configFields, status, config } = req.body;
  
  const gateway = await prisma.paymentGateway.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(logo && { logo }),
      ...(themeColor && { themeColor }),
      ...(configFields && { configFields }),
      ...(status && { status }),
      ...(config && { config: config })  // ✅ CORRIGIDO: salvando no campo correto
    }
  });
  
  return res.json({ paymentGateway: gateway });
});

// DELETE /payment-gateways/:id - delete payment gateway (Super Admin/Admin only)
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  
  // Verificar se existem tenants usando este gateway
  const tenantsUsingGateway = await prisma.tenant.count({
    where: { paymentGatewayId: id }
  });
  
  if (tenantsUsingGateway > 0) {
    return res.status(400).json({ 
      error: `Não é possível excluir este gateway pois ${tenantsUsingGateway} imobiliária(s) ainda o utilizam.` 
    });
  }
  
  await prisma.paymentGateway.delete({
    where: { id }
  });
  
  return res.json({ success: true });
});

export default router;
