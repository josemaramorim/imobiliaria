import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCreateInteraction() {
    try {
        console.log('🔄 Iniciando teste de criação de interação...');

        // 1. Find a valid user (Admin)
        const user = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!user) {
            console.error('❌ Nenhum usuário ADMIN encontrado para teste.');
            return;
        }
        console.log(`✅ Usuário encontrado: ${user.name} (${user.id})`);

        // 2. Find a valid lead
        const lead = await prisma.lead.findFirst({
            where: { tenantId: user.tenantId }
        });

        if (!lead) {
            console.error('❌ Nenhum Lead encontrado para teste.');
            return;
        }
        console.log(`✅ Lead encontrado: ${lead.name} (${lead.id})`);

        // 3. Create interaction
        console.log('📤 Criando interação...');

        const interaction = await prisma.interaction.create({
            data: {
                type: 'NOTE',
                date: new Date(),
                notes: 'Teste via script corrigido',
                leadId: lead.id,
                createdBy: user.id,
                tenantId: user.tenantId
            }
        });

        console.log('✅ Interação criada com sucesso!');
        console.log(`   ID: ${interaction.id}`);
        console.log(`   Notes: ${interaction.notes}`);

    } catch (error) {
        console.error('❌ Erro ao criar interação:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCreateInteraction();
