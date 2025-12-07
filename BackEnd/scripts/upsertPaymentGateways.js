const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const gateways = [
    { id: 'stripe', name: 'Stripe', logo: '', themeColor: '#6772E5', status: 'ACTIVE', configFields: [{ key: 'apiKey', label: 'API Key' }], config: {} },
    { id: 'pagarme', name: 'Pagar.me', logo: '', themeColor: '#1E3A8A', status: 'INACTIVE', configFields: [{ key: 'token', label: 'Token' }], config: {} },
    { id: 'asaas', name: 'Asaas', logo: '', themeColor: '#00253A', status: 'ACTIVE', configFields: [{ key: 'apiKey', label: 'API Key' }], config: {} },
    { id: 'pagseguro', name: 'PagSeguro', logo: '', themeColor: '#FFC801', status: 'ACTIVE', configFields: [{ key: 'email', label: 'Email' }, { key: 'token', label: 'Token' }], config: {} },
  ];

  try {
    for (const gateway of gateways) {
      await prisma.paymentGateway.upsert({
        where: { id: gateway.id },
        update: gateway,
        create: gateway,
      });
      console.log(`Upserted gateway ${gateway.id}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
