import prisma from './prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🧹 Limpando dados antigos...');
  await prisma.$transaction([
    prisma.interaction.deleteMany(),
    prisma.opportunity.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.property.deleteMany(),
    prisma.user.deleteMany(),
    prisma.tenant.deleteMany(),
    prisma.subscriptionPlan.deleteMany(),
    prisma.paymentGateway.deleteMany(),
    prisma.globalSettings.deleteMany()
  ]).catch(() => { });

  console.log('✨ Criando configurações globais...');
  await prisma.globalSettings.create({ data: { platformName: 'ImobIA', defaultCurrency: 'BRL', maintenanceMode: false, allowSignups: true } });

  console.log('✨ Criando gateways de pagamento...');
  await prisma.paymentGateway.createMany({
    data: [
      { id: 'stripe', name: 'Stripe', logo: '', themeColor: '#6772E5', status: 'ACTIVE', configFields: JSON.stringify([{ key: 'apiKey', label: 'API Key' }]) },
      { id: 'pagarme', name: 'Pagar.me', logo: '', themeColor: '#1E3A8A', status: 'INACTIVE', configFields: JSON.stringify([{ key: 'token', label: 'Token' }]) },
      { id: 'asaas', name: 'Asaas', logo: '', themeColor: '#6772E5', status: 'ACTIVE', configFields: JSON.stringify([{ key: 'apiKey', label: 'API Key' }]) },
      { id: 'pagseguro', name: 'PagSeguro', logo: '', themeColor: '#A5A5A5', status: 'ACTIVE', configFields: JSON.stringify([{ key: 'token', label: 'Token' }]) },      
      { id: 'paypal', name: 'PayPal', logo: '', themeColor: '#003087', status: 'ACTIVE', configFields: JSON.stringify([{ key: 'clientId', label: 'Client ID' }, { key: 'clientSecret', label: 'Client Secret' }]) },
    ]
  });

  console.log('✨ Criando planos de assinatura...');
  const basic = await prisma.subscriptionPlan.create({ data: { name: 'Basic', price: 29.0, billingCycle: 'MENSAL', features: ['5 propriedades', '1 usuário'] } });
  const pro = await prisma.subscriptionPlan.create({ data: { name: 'Pro', price: 99.0, billingCycle: 'MENSAL', features: ['Propriedades ilimitadas', 'Equipe completa', 'Suporte 24/7'] } });

  console.log('🔐 Criando usuário super-admin...');
  const hash = await bcrypt.hash('admin', 10); // Senha 'admin' conforme FrontEnd
  const admin = await prisma.user.create({ data: { name: 'Super Admin', email: 'admin@saas.com', passwordHash: hash, role: 'SUPER_ADMIN', avatarUrl: 'https://ui-avatars.com/api/?name=SA&background=000&color=fff' } });

  console.log('🏢 Criando um tenant de exemplo...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Imobiliaria Exemplo', domain: 'exemplo', themeColor: '#4f46e5', planId: pro.id, paymentGatewayId: 'stripe', status: 'ACTIVE'
    }
  });

  console.log('🔑 Criando usuário do tenant (manager)...');
  const userHash = await bcrypt.hash('123456', 10); // Senha '123456' conforme FrontEnd
  await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.r@apollo.app',
      passwordHash: userHash,
      role: 'ADMIN',
      tenantId: tenant.id,
      avatarUrl: 'https://picsum.photos/id/64/200/200'
    }
  });

  console.log('✅ Seed finalizado.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
