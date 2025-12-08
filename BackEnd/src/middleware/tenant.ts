import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(__dirname, '../../debug.log');

function logDebug(msg: string) {
  try {
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {
    console.error('Falha ao escrever log:', e);
  }
}

export async function identifyTenant(req: Request, res: Response, next: NextFunction) {
  // priority: x-tenant-id header -> query -> body -> logged user tenant
  const header = req.headers['x-tenant-id'] as string | undefined;
  const query = (req.query.tenantId as string | undefined);
  const body = (req.body && req.body.tenantId) ? req.body.tenantId : undefined;

  logDebug(`🔍 [Middleware] identifyTenant - Headers: ${JSON.stringify(req.headers)}`);
  logDebug(`🔍 [Middleware] identifyTenant - Header: ${header}, Query: ${query}, Body: ${body}`);

  let tenantId = header || query || body;

  // Normaliza casos em que o valor veio serializado com aspas (ex: "tenantId")
  if (tenantId && typeof tenantId === 'string' && tenantId.length > 1) {
    const trimmed = tenantId.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith('\'') && trimmed.endsWith('\''))) {
      tenantId = trimmed.slice(1, -1);
    }
  }

  // if not provided, try to find from user id (if present in header by middleware/auth)
  // auth middleware sets req.user.sub
  const anyReq = req as any;
  if (!tenantId && anyReq.user && anyReq.user.sub) {
    try {
      const user = await prisma.user.findUnique({ where: { id: anyReq.user.sub } });
      if (user?.tenantId) {
        tenantId = user.tenantId;
        logDebug(`🔍 [Middleware] identifyTenant - Encontrado via User ID: ${tenantId}`);
      }
    } catch (err) {
      // ignore
    }
  }

  if (tenantId) {
    res.locals.tenantId = tenantId;
    logDebug(`✅ [Middleware] identifyTenant - Definido res.locals.tenantId: ${tenantId}`);
  } else {
    logDebug(`⚠️ [Middleware] identifyTenant - Nenhum tenantId identificado`);
  }
  return next();
}

export async function requireTenant(req: Request, res: Response, next: NextFunction) {
  const tenantId = res.locals.tenantId as string | undefined;
  logDebug(`🔍 [Middleware] requireTenant - ID recebido: ${tenantId}`);

  if (!tenantId) {
    logDebug('❌ [Middleware] tenantId ausente em res.locals');
    return res.status(400).json({ error: 'tenant_missing' });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant) {
    logDebug(`❌ [Middleware] Tenant não encontrado no banco para ID: ${tenantId}`);
    // Debug: listar todos os tenants para ver o que tem lá
    const all = await prisma.tenant.findMany({ select: { id: true } });
    logDebug(`📋 [Middleware] Tenants disponíveis: ${all.map(t => t.id).join(', ')}`);
    return res.status(404).json({ error: 'tenant_not_found' });
  }

  if (tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') return res.status(403).json({ error: 'tenant_inactive' });
  return next();
}
