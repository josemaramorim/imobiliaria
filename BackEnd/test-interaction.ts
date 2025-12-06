import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCreateInteraction() {
    try {
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

        // 3. Simulate Payload from Frontend
        const payload = {
            type: 'CALL', // Enum: CALL, EMAIL, MEETING, NOTE, WHATSAPP
            date: new Date().toISOString(),
            notes: 'Teste de interação via script de debug',
            leadId: lead.id,
            createdBy: user.id,
            tenantId: user.tenantId // Backend middleware adds this usually, but prisma needs it
        };

        console.log('📤 Tentando criar interação com payload:', payload);

        // 4. Attempt to create interaction directly via Prisma (simulating what the route does)
        // Note: The route uses interactionSchema to validate first, then prisma.create

        // Let's try to validate with Zod schema if possible, but for now direct prisma
        const interaction = await prisma.interaction.create({
            data: {
                type: 'CALL',
                date: payload.date,
                notes: payload.notes,
                createdBy: payload.createdBy,
                leadId: payload.leadId,
                tenantId: payload.tenantId
            }
        });

        console.log('✅ Interação criada com sucesso!');
        console.log(interaction);

    } catch (error) {
        console.error('❌ Erro ao criar interação:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCreateInteraction();
