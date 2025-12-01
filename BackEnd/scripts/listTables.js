const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`;
    console.log('tables:');
    for (const r of rows) console.log(' -', r.table_name || r.table_name);
  } catch (e) {
    console.error('error:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
