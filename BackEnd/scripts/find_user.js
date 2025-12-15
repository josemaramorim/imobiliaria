const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/find_user.js <email>');
  process.exit(2);
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, role: true, tenantId: true, status: true, createdAt: true } });
  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch(err => { console.error('ERROR', err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
