import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export async function identifyTenant(req: Request, res: Response, next: NextFunction) {
  // priority: x-tenant-id header -> query -> body -> logged user tenant
  const header = req.headers['x-tenant-id'] as string | undefined;
  const query = (req.query.tenantId as string | undefined);
  const body = (req.body && req.body.tenantId) ? req.body.tenantId : undefined;
  let tenantId = header || query || body;

  // if not provided, try to find from user id (if present in header by middleware/auth)
  // auth middleware sets req.user.sub
  const anyReq = req as any;
  if (!tenantId && anyReq.user && anyReq.user.sub) {
    try {
      const user = await prisma.user.findUnique({ where: { id: anyReq.user.sub } });
      if (user?.tenantId) tenantId = user.tenantId;
    } catch (err) {
      // ignore
    }
  }

  if (tenantId) {
    res.locals.tenantId = tenantId;
  }
  return next();
}

export async function requireTenant(req: Request, res: Response, next: NextFunction) {
  const tenantId = res.locals.tenantId as string | undefined;
  if (!tenantId) return res.status(400).json({ error: 'tenant_missing' });
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return res.status(404).json({ error: 'tenant_not_found' });
  if (tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') return res.status(403).json({ error: 'tenant_inactive' });
  return next();
}
