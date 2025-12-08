import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { sub: string; role?: string };
}

// Validação obrigatória do JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('ERRO CRÍTICO: JWT_SECRET deve ser definido nas variáveis de ambiente (.env)');
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || null;
  if (!token) return res.status(401).json({ error: 'token_missing' });
  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as any;
    req.user = { sub: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'token_invalid' });
  }
}

export function requireRole(role: string) {
  return function (req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    const privilegedRoles = ['ADMIN', 'SUPER_ADMIN'];
    if (req.user.role === role || privilegedRoles.includes(req.user.role || '')) {
      return next();
    }
    return res.status(403).json({ error: 'forbidden' });
  };
}
