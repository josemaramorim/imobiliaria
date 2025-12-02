import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export const requireOwnership = (model: 'property' | 'lead' | 'opportunity' | 'visit') => {
    return async (req: any, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const tenantId = res.locals.tenantId;

        if (!tenantId) {
            return res.status(400).json({ error: 'tenant_required' });
        }

        try {
            // Busca o recurso pelo ID e seleciona apenas o tenantId para verificação
            const record = await (prisma[model] as any).findUnique({
                where: { id },
                select: { tenantId: true }
            });

            if (!record) {
                return res.status(404).json({ error: 'not_found' });
            }

            // Verifica se o recurso pertence ao tenant atual
            if (record.tenantId !== tenantId) {
                return res.status(403).json({ error: 'forbidden', message: 'Acesso negado a este recurso' });
            }

            next();
        } catch (err) {
            console.error('Ownership check error:', err);
            return res.status(500).json({ error: 'server_error' });
        }
    };
};
