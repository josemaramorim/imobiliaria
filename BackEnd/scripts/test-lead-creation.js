const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000';

async function testLeadCreation() {
    try {
        console.log('1. Tentando fazer login...');
        const loginResp = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'alex.r@apollo.app',
                password: '123456'
            })
        });

        if (!loginResp.ok) {
            throw new Error(`Login falhou: ${loginResp.status} ${loginResp.statusText}`);
        }

        const loginData = await loginResp.json();
        console.log('🔍 Resposta do Login:', JSON.stringify(loginData, null, 2));

        const token = loginData.token;
        const tenantId = loginData.user.tenantId;

        if (!tenantId) {
            console.warn('⚠️ AVISO: Usuário não tem tenantId associado!');
        } else {
            console.log('✅ Login OK. Token recebido.');
            console.log('Tenant ID:', tenantId);
        }

        console.log('\n2. Tentando criar lead via API...');
        const newLead = {
            name: `Lead Teste ${Date.now()}`,
            email: `teste${Date.now()}@example.com`,
            phone: '11999999999',
            source: 'API Test',
            status: 'Novo',
            isActive: true,
            customValues: {}
        };

        const createResp = await fetch(`${API_URL}/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-tenant-id': tenantId
            },
            body: JSON.stringify(newLead)
        });

        if (!createResp.ok) {
            const errorText = await createResp.text();
            throw new Error(`Criação de lead falhou: ${createResp.status} ${createResp.statusText} - ${errorText}`);
        }

        const createData = await createResp.json();
        const leadId = createData.lead.id;
        console.log('✅ Lead criado via API:', leadId);

        console.log('\n3. Verificando no banco de dados...');
        const dbLead = await prisma.lead.findUnique({
            where: { id: leadId }
        });

        if (dbLead) {
            console.log('✅ SUCESSO! Lead encontrado no banco de dados:');
            console.log(dbLead);
        } else {
            console.error('❌ ERRO CRÍTICO: Lead não encontrado no banco de dados!');
        }

    } catch (error) {
        console.error('❌ Falha no teste:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testLeadCreation();
