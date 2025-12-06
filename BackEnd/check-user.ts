import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    const email = 'josemaramorim@yahoo.com.br';

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                tenantId: true,
            }
        });

        if (user) {
            console.log('✅ Usuário encontrado:');
            console.log(`   Email: ${user.email}`);
            console.log(`   Nome: ${user.name}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Status: ${user.status}`);
            console.log(`   TenantId: ${user.tenantId}`);
        } else {
            console.log('❌ Usuário NÃO encontrado no banco de dados!');
            console.log(`   Email procurado: ${email}`);
        }
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
