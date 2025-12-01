# Apollo Real Estate Cloud - Backend (Boilerplate)

Este diretório contém um backend inicial para a plataforma SaaS "Apollo Real Estate Cloud" (Node.js + TypeScript + Express + Prisma + PostgreSQL).

## Pontos principais
- Prisma como ORM com schema em `prisma/schema.prisma`
- Autenticação JWT em `src/middleware/auth.ts`
- Zod para validação em `src/validators/schemas.ts`
- Rotas REST básicas: `auth`, `users`, `tenants`, `plans`, `properties`, `leads`
- Sistema simples de i18n compatível com as chaves usadas no frontend em `src/i18n.ts`

## Como rodar localmente
1. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` e `JWT_SECRET`.

2. Instale dependências

```powershell
cd BackEnd; npm install
```

3. Gerar client Prisma e aplicar migração

```powershell
npm run prisma:generate
npm run prisma:migrate
```

4. Popular dados de exemplo (seed)

```powershell
npm run seed
```

5. Executar em desenvolvimento

```powershell
npm run dev
```

## Rotas úteis
- GET /health
- POST /auth/login
- POST /auth/register
- GET /users/me
- Rotas do SaaS admin: /tenants, /plans
- Rotas tenant-scoped: /properties, /leads
 
## Exemplos rápidos (curl)

1) Login (gera JWT)

```powershell
curl -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"email":"admin@apollo.example","password":"password"}'
```

2) Usar token com tenant via header (X-Tenant-Id) — muitas rotas aceitam `X-Tenant-Id` ou usam `tenantId` do token JWT.

```powershell
# Buscar propriedades do tenant
curl -H "Authorization: Bearer <TOKEN>" -H "X-Tenant-Id: <TENANT_ID>" http://localhost:4000/properties

# Criar lead
curl -X POST http://localhost:4000/leads -H "Authorization: Bearer <TOKEN>" -H "X-Tenant-Id: <TENANT_ID>" -H "Content-Type: application/json" -d '{"name":"João","email":"joao@example.com","phone":"11900001111"}'
```

3) Marcar fatura como paga

```powershell
curl -X POST http://localhost:4000/invoices/<INVOICE_ID>/mark-paid -H "Authorization: Bearer <TOKEN>" -H "X-Tenant-Id: <TENANT_ID>"
```

## Documentação interativa (Swagger)

Após iniciar o servidor em desenvolvimento, a documentação gerada a partir do OpenAPI estará disponível em:

```
http://localhost:4000/docs
```

Lá você pode navegar por todos os endpoints, inspecionar schemas e executar chamadas diretamente (use o Bearer token obtido em /auth/login).

Você também pode baixar a especificação YAML diretamente para uso em outras ferramentas:

```
http://localhost:4000/openapi.yaml
```


## Observações
- Esse é um scaffold inicial. Falta tratamento de autorização mais granular, testes, validação de multi-tenant em middleware, integração com gateways de pagamento reais e suporte completo a Webhooks/API Keys.
- Mensagens multilíngues seguem as chaves e padrões do FrontEnd (`FrontEnd/i18n.tsx`) em `src/i18n.ts`.

## Integração com gateway de pagamentos (Asaas - sandbox)

1) Configure a sandbox do Asaas e adicione a chave no `.env`:

```powershell
ASAAS_API_KEY=your_asaas_sandbox_api_key
ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3
```

2) Endpoints disponíveis para checkout:

- POST /checkout
	- Corpo (JSON): { planName, amount, issueDate, dueDate }
	- Retorna: o objeto Invoice salvo e informações retornadas pelo gateway (URL, QR, id externo).

- GET /checkout/:invoiceId
	- Retorna o estado atual do invoice e dados do gateway remoto (quando disponível).

3) Webhook para notificações de pagamento (configure no painel Asaas):

- POST /webhooks/payments
	- Recebe notificações do gateway e atualiza automaticamente o `Invoice.status` (PAID/OVERDUE/PENDING) no banco.

Exemplo rápido de criar um checkout (com token):

```powershell
curl -X POST http://localhost:4000/checkout \
	-H "Authorization: Bearer <TOKEN>" \
	-H "X-Tenant-Id: <TENANT_ID>" \
	-H "Content-Type: application/json" \
	-d '{"planName":"Pro","amount":99.0,"issueDate":"2025-11-20T00:00:00Z","dueDate":"2025-11-10T00:00:00Z"}'
```

4) Segurança: para produção você deverá validar assinaturas (headers) dos webhooks e proteger rotas sensíveis.
