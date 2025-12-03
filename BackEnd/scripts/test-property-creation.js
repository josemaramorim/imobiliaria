const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000';

async function testPropertyCreation() {
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

        if (!loginResp.ok) throw new Error(`Login falhou: ${loginResp.status}`);
        const loginData = await loginResp.json();
        const token = loginData.token;
        const tenantId = loginData.user.tenantId;

        console.log('✅ Login OK. Tenant ID:', tenantId);

        console.log('\n2. Tentando criar imóvel via API...');
        const newProperty = {
            title: `Imóvel Teste ${Date.now()}`,
            address: 'Rua Teste, 123',
            price: 500000,
            area: 100,
            bedrooms: 3,
            bathrooms: 2,
            status: 'AVAILABLE',
            // customValues intencionalmente omitido para testar default
            // tenantId intencionalmente omitido para testar schema
        };

        const createResp = await fetch(`${API_URL}/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-tenant-id': tenantId
            },
            body: JSON.stringify(newProperty)
        });

        if (!createResp.ok) {
            const errorText = await createResp.text();
            throw new Error(`Criação de imóvel falhou: ${createResp.status} - ${errorText}`);
        }

        const createData = await createResp.json();
        const propertyId = createData.property.id;
        console.log('✅ Imóvel criado via API:', propertyId);

        console.log('\n3. Verificando no banco de dados...');
        const dbProperty = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (dbProperty) {
            console.log('✅ SUCESSO! Imóvel encontrado no banco:');
            console.log(dbProperty);
        } else {
            console.error('❌ ERRO: Imóvel não encontrado no banco!');
        }

    } catch (error) {
        console.error('❌ Falha no teste:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testPropertyCreation();
