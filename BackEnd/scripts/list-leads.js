const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listLeads() {
    try {
        console.log('📋 Listando todos os leads no banco de dados...\n');

        const leads = await prisma.lead.findMany({
            include: {
                tags: true,
                tenant: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (leads.length === 0) {
            console.log('⚠️  Nenhum lead encontrado no banco de dados!');
        } else {
            console.log(`✅ Encontrados ${leads.length} lead(s):\n`);
            leads.forEach((lead, index) => {
                console.log(`${index + 1}. ${lead.name}`);
                console.log(`   Email: ${lead.email}`);
                console.log(`   Phone: ${lead.phone}`);
                console.log(`   Source: ${lead.source}`);
                console.log(`   Status: ${lead.status}`);
                console.log(`   Tenant: ${lead.tenant?.name} (${lead.tenantId})`);
                console.log(`   Tags: ${lead.tags.length} tag(s)`);
                console.log(`   Created: ${lead.createdAt}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Erro ao listar leads:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

listLeads();
