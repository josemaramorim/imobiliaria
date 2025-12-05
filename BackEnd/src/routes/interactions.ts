// Adicione este log temporário para debug
import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { interactionSchema } from '../validators/schemas';
import { requireAuth } from '../middleware/auth';
import { identifyTenant, requireTenant } from '../middleware/tenant';
import { requireOwnership } from '../middleware/ownership';
import { t } from '../i18n';

const router = Router();

router.get('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  const tenantId = res.locals.tenantId;
  const items = await prisma.interaction.findMany({ where: { tenantId } });
  return res.json({ interactions: items });
});

router.post('/', requireAuth, identifyTenant, requireTenant, async (req: any, res: any) => {
  console.log('📥 Payload recebido:', JSON.stringify(req.body, null, 2));
  console.log('🔑 TenantId do middleware:', res.locals.tenantId);

  const parsed = interactionSchema.safeParse(req.body);

  if (!parsed.success) {
    console.error('❌ Validação falhou:', JSON.stringify(parsed.error.format(), null, 2));
    return res.status(400).json({ error: 'validation', details: parsed.error.format() });
  }

  console.log('✅ Validação passou, dados parseados:', JSON.stringify(parsed.data, null, 2));

  try {
    const interaction = await prisma.interaction.create({ data: { ...parsed.data as any, tenantId: res.locals.tenantId } });
    console.log('✅ Interação criada:', interaction.id);
    return res.status(201).json({ message: t(req, 'interaction.added'), interaction });
  } catch (err: any) {
    console.error('❌ Erro ao criar interação:', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

router.delete('/:id', requireAuth, identifyTenant, requireTenant, requireOwnership('interaction'), async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await prisma.interaction.delete({ where: { id } });
    return res.json({ deleted: true });
  } catch (err: any) {
    console.error('delete interaction err', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

export default router;
