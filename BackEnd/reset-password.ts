import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
    const email = 'josemaramorim@yahoo.com.br';
    const newPassword = '123456';

    try {
        // Gerar hash da nova senha
        const passwordHash = await bcrypt.hash(newPassword, 10);

        console.log('🔐 Testando hash da senha "123456":');
        console.log(`   Hash gerado: ${passwordHash}`);

        // Testar se o hash funciona
        const isValid = await bcrypt.compare(newPassword, passwordHash);
        console.log(`   ✅ Validação do hash: ${isValid ? 'OK' : 'FALHOU'}`);

        // Atualizar usuário
        const user = await prisma.user.update({
            where: { email },
            data: { passwordHash },
        });

        console.log(`\n✅ Senha atualizada com sucesso para: ${user.email}`);
        console.log(`   Nova senha: ${newPassword}`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Role: ${user.role}`);

        // Verificar se a senha foi salva corretamente
        const updatedUser = await prisma.user.findUnique({ where: { email } });
        if (updatedUser) {
            const passwordMatches = await bcrypt.compare(newPassword, updatedUser.passwordHash);
            console.log(`\n🔍 Verificação final:`);
            console.log(`   Senha "123456" funciona? ${passwordMatches ? '✅ SIM' : '❌ NÃO'}`);
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar senha:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
