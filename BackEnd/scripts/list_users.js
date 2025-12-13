const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, passwordHash: true, tenantId: true } });
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(err => { console.error('ERROR', err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
