const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTenant() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'alex.r@apollo.app' }
        });

        if (!user) {
            console.log('Usuário não encontrado!');
            return;
        }

        console.log('Tenant ID do usuário:', user.tenantId);

        if (user.tenantId) {
            const tenant = await prisma.tenant.findUnique({
                where: { id: user.tenantId }
            });

            if (tenant) {
                console.log('✅ Tenant encontrado:', tenant);
            } else {
                console.error('❌ Tenant NÃO encontrado na tabela Tenant! ID inválido.');

                // Corrigir: Buscar um tenant válido ou criar um novo
                const validTenant = await prisma.tenant.findFirst();
                if (validTenant) {
                    console.log(`Corrigindo usuário para usar tenant válido: ${validTenant.id}`);
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { tenantId: validTenant.id }
                    });
                } else {
                    console.log('Criando novo tenant...');
                    const newTenant = await prisma.tenant.create({
                        data: {
                            id: `tnt_${Date.now()}`,
                            name: 'Imobiliária Demo',
                            slug: 'imobiliaria-demo',
                            status: 'ACTIVE',
                            plan: 'FREE'
                        }
                    });
                    console.log(`Novo tenant criado: ${newTenant.id}`);
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { tenantId: newTenant.id }
                    });
                }
                console.log('✅ Usuário corrigido!');
            }
        } else {
            console.log('Usuário não tem tenantId.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkTenant();
