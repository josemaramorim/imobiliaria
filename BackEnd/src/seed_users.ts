import prisma from './prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🔐 Seed de usuários (somente users) — iniciando...');

  const adminPassword = 'admin';
  const alexPassword = '123456';

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const alexHash = await bcrypt.hash(alexPassword, 10);

  // Tenta usar um tenant existente para associar o usuário Alex, se houver
  const tenant = await prisma.tenant.findFirst();

  // Upsert do Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@saas.com' },
    update: {
      name: 'Super Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
      avatarUrl: 'https://ui-avatars.com/api/?name=SA&background=000&color=fff'
    },
    create: {
      name: 'Super Admin',
      email: 'admin@saas.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      avatarUrl: 'https://ui-avatars.com/api/?name=SA&background=000&color=fff'
    }
  });

  // Upsert do usuário do tenant (Alex)
  await prisma.user.upsert({
    where: { email: 'alex.r@apollo.app' },
    update: {
      name: 'Alex Rivera',
      passwordHash: alexHash,
      role: 'ADMIN',
      avatarUrl: 'https://picsum.photos/id/64/200/200',
      tenantId: tenant?.id ?? null
    },
    create: {
      name: 'Alex Rivera',
      email: 'alex.r@apollo.app',
      passwordHash: alexHash,
      role: 'ADMIN',
      tenantId: tenant?.id ?? undefined,
      avatarUrl: 'https://picsum.photos/id/64/200/200'
    }
  });

  console.log('✅ Seed de usuários finalizado. Usuários criados/atualizados: admin@saas.com, alex.r@apollo.app');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
