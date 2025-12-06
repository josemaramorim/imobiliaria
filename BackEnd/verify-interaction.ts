import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyInteractionPersistence() {
    console.log('🔍 Iniciando verificação de persistência...');

    try {
        // 1. Buscar um usuário ADMIN
        const user = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!user) {
            console.error('❌ Erro: Nenhum usuário ADMIN encontrado.');
            return;
        }
        console.log(`👤 Usuário encontrado: ${user.name} (${user.id})`);

        // 2. Buscar um Lead do mesmo tenant
        const lead = await prisma.lead.findFirst({
            where: { tenantId: user.tenantId }
        });

        if (!lead) {
            console.error('❌ Erro: Nenhum Lead encontrado para este tenant.');
            return;
        }
        console.log(`📋 Lead encontrado: ${lead.name} (${lead.id})`);

        // 3. Criar uma Interação de Teste
        const testNote = `Teste de Verificação ${Date.now()}`;
        console.log(`💾 Salvando interação: "${testNote}"...`);

        const created = await prisma.interaction.create({
            data: {
                type: 'NOTE',
                date: new Date(),
                notes: testNote,
                leadId: lead.id,
                createdBy: user.id,
                tenantId: user.tenantId
            }
        });

        console.log(`✅ Interação criada com ID: ${created.id}`);

        // 4. Verificar se ela realmente está no banco
        console.log('🔎 Buscando interação recém-criada no banco...');
        const retrieved = await prisma.interaction.findUnique({
            where: { id: created.id }
        });

        if (retrieved) {
            console.log('🎉 SUCESSO! Interação encontrada no banco de dados:');
            console.log(JSON.stringify(retrieved, null, 2));

            // Limpeza (opcional, mas bom para não sujar o banco)
            // await prisma.interaction.delete({ where: { id: created.id } });
            // console.log('🧹 Interação de teste removida.');
        } else {
            console.error('❌ FALHA: Interação criada mas não encontrada na busca subsequente!');
        }

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyInteractionPersistence();
