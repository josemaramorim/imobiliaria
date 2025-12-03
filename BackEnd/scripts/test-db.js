import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.count();
        console.log('✅ Conexão OK – número de usuários:', users);
    } catch (e) {
        console.error('❌ Falha na conexão:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();