# Plano de Melhoria e Execução

## Urgente
- ~~**Editar membro**: Adicionar botão/fluxo para alterar senha ao editar membro da equipe.~~ ✅
- ~~**Lead – Informações Adicionais**: Campo aparece na página, mas não persiste ao salvar; corrigir persistência.~~ ✅
- ~~**Imóveis – Características e Detalhes**: Campos aparecem, mas não são salvos; corrigir persistência.~~ ✅

## Prioridade Alta
- ~~**Banco e migrações**~~ ✅ Concluído: acesso ao Postgres ajustado e `prisma generate` ok.
- ~~**Integridade de tags/leads/oportunidades**~~ ✅ Concluído: migração de colunas aplicada e rotas ajustadas.
- ~~**Variáveis de ambiente**~~ ✅ Concluído: `.env` ajustado; pending se desejar `.env.example`/validação zod.
- **Logs básicos**: Manter logs em `/tags`; adicionar correlação simples (request id) e captura centralizada de erros.

## Prioridade Média
- **Testes backend**: Integração com supertest para rotas críticas (auth, tenants, tags, leads, opportunities, payment-gateways) usando Postgres em Docker + seeds mínimos.
- **Lint/format**: Adicionar ESLint + Prettier em BackEnd/FrontEnd; scripts `lint`/`format` e checagem em CI.
- **Segurança**: Adicionar helmet; CORS com allowlist configurável; validar payloads mutáveis com zod em todas as rotas.
- **Observabilidade**: Logs em JSON opcionais via env; preparar para envio a agregador.
- **DevEx**: Script para subir backend+frontend juntos (concurrently); docker-compose com Postgres para dev.

## Prioridade Baixa
- **Cache leve**: Cache (memória ou Redis opcional) para listas estáveis (plans, payment-gateways) com invalidação simples.
- **Documentação**: Garantir `/docs` atualizado; gerar `openapi.json`/`yaml` de fonte única e versionar.
- **Saúde e métricas**: `/health` já existe; adicionar `/metrics` (Prometheus) e checar dependências (DB).

## FrontEnd
- **Build/stability**: Rodar `npm install` no FrontEnd e corrigir o erro do `npm run dev` (capturar log para ajustes).
- **UX de erro**: Manter alertas; reforçar estados de loading/empty/error em tags/leads/oportunidades.
- **Tipagem/validação**: Tipar payloads de API com zod ou tipos gerados de OpenAPI; evitar `any`.
- **Lint/format**: Mesma stack ESLint/Prettier; opcional husky + lint-staged.
- **Acessibilidade/UI**: Conferir contraste, foco e usar skeletons/spinners consistentes.

## Próximos passos imediatos
1) Conectar ao Postgres e rodar `npx prisma migrate deploy` + `npx prisma generate`.
2) Rodar `npm install` em `FrontEnd/` e tentar `npm run dev`; coletar log se falhar.
3) Se aprovado, iniciar setup de lint/format + docker-compose para dev.
