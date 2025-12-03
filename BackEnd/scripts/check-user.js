const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'alex.r@apollo.app' },
            include: { tenant: true }
        });

        console.log('Dados do Usuário:', JSON.stringify(user, null, 2));

        if (!user) {
            console.log('Usuário não encontrado!');
        } else if (!user.tenantId) {
            console.log('⚠️ Usuário NÃO tem tenantId!');

            // Tentar encontrar um tenant existente para associar
            const tenant = await prisma.tenant.findFirst();
            if (tenant) {
                console.log(`Encontrado tenant ${tenant.id}. Associando...`);
                await prisma.user.update({
                    where: { id: user.id },
                    data: { tenantId: tenant.id }
                });
                console.log('✅ Usuário associado ao tenant com sucesso!');
            } else {
                console.log('⚠️ Nenhum tenant encontrado no banco. Criando um...');
                const newTenant = await prisma.tenant.create({
                    data: {
                        name: 'Imobiliária Demo',
                        slug: 'imobiliaria-demo',
                        plan: 'FREE'
                    }
                });
                await prisma.user.update({
                    where: { id: user.id },
                    data: { tenantId: newTenant.id }
                });
                console.log('✅ Tenant criado e usuário associado!');
            }
        } else {
            console.log('✅ Usuário já tem tenantId:', user.tenantId);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
