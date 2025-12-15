// Script para atualizar status do tenant e nextBillingDate com base nas faturas
// Execute este script periodicamente (ex: via cron)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTenantsStatus() {
  const tenants = await prisma.tenant.findMany({
    include: { invoices: true }
  });
  const now = new Date();

  for (const tenant of tenants) {
    // Busca a próxima fatura a vencer
    const nextInvoice = tenant.invoices
      .filter(inv => inv.dueDate > now)
      .sort((a, b) => a.dueDate - b.dueDate)[0];
    // Busca faturas vencidas não pagas
    const overdue = tenant.invoices.some(inv => inv.dueDate < now && inv.status !== 'PAID');

    let newStatus = tenant.status;
    if (overdue) {
      newStatus = 'PAST_DUE';
    } else if (tenant.status === 'PAST_DUE' && !overdue) {
      newStatus = 'ACTIVE';
    }

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        nextBillingDate: nextInvoice ? nextInvoice.dueDate : null,
        status: newStatus
      }
    });
    console.log(`Tenant ${tenant.name} atualizado: status=${newStatus}, nextBillingDate=${nextInvoice ? nextInvoice.dueDate : 'null'}`);
  }
}

updateTenantsStatus()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
