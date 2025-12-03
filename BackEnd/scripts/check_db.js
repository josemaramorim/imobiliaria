
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Tenants ---');
    const tenants = await prisma.tenant.findMany();
    console.log(tenants);

    console.log('\n--- Leads ---');
    const leads = await prisma.lead.findMany();
    console.log(`Total leads: ${leads.length}`);
    leads.forEach(l => {
        console.log(`Lead: ${l.name} (ID: ${l.id}), Tenant: ${l.tenantId}, Status: ${l.status}, Active: ${l.isActive}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
