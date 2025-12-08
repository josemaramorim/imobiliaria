import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
// usersRouter already imported above
import tenantsRouter from './routes/tenants';
import plansRouter from './routes/plans';
import paymentGatewaysRouter from './routes/paymentGateways';
import propertiesRouter from './routes/properties';
import leadsRouter from './routes/leads';
import opportunitiesRouter from './routes/opportunities';
import interactionsRouter from './routes/interactions';
import visitsRouter from './routes/visits';
import tagsRouter from './routes/tags';
import invoicesRouter from './routes/invoices';
import apiKeysRouter from './routes/apikeys';
import webhooksRouter from './routes/webhooks';
import checkoutRouter from './routes/checkout';
import paymentWebhooksRouter from './routes/paymentWebhooks';
import settingsRouter from './routes/settings';
import customFieldsRouter from './routes/customFields';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const resolveSpecPath = (filename: string) => {
  const candidates = [
    path.join(__dirname, filename),
    path.join(__dirname, '..', 'src', filename),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
};

const loadJsonSpec = () => {
  const jsonPath = resolveSpecPath('openapi.json');
  if (!jsonPath) {
    return null;
  }
  try {
    const jsonText = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(jsonText);
  } catch (err) {
    console.warn(`Failed to read openapi.json at ${jsonPath}:`, err);
    return null;
  }
};

const openapiYamlPath = resolveSpecPath('openapi.yaml');
let openapiSpec: any = loadJsonSpec() ?? {};

if (openapiYamlPath) {
  try {
    const yamlText = fs.readFileSync(openapiYamlPath, 'utf8');
    if (yamlText && yamlText.trim().length > 0) {
      openapiSpec = yaml.load(yamlText);
    }
  } catch (err) {
    console.warn(`openapi.yaml parse failed (${openapiYamlPath}), falling back to openapi.json`);
  }
} else {
  console.warn('openapi.yaml not found, using JSON spec if available');
}
import usersRouter from './routes/users';

// Debug: verificar qual DATABASE_URL está sendo usada
console.log('🛠️  DATABASE_URL configurada:', process.env.DATABASE_URL?.substring(0, 50) + '...');

export const createServer = async () => {
  const app = express();

  // Temporariamente permitir todas as origens (remover controle de CORS)
  // Quando quiser reativar o controle de origins, restaure a configuração anterior
  // e use a variável de ambiente `ALLOWED_ORIGINS`.
  app.use(cors());

  app.use(express.json());

  // Rate limiter para endpoints de autenticação (proteção contra força bruta)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas por janela
    message: {
      error: 'too_many_requests',
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Rate limiter geral para API (proteção contra abuso)
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // 100 requisições por minuto
    message: {
      error: 'too_many_requests',
      message: 'Limite de requisições excedido. Tente novamente em breve.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  // Aplicar rate limiting geral em todas as rotas da API
  app.use('/users', usersRouter);
  app.use('/tenants', tenantsRouter);
  app.use('/plans', plansRouter);
  app.use('/payment-gateways', paymentGatewaysRouter);
  app.use('/settings', settingsRouter);
  app.use('/properties', propertiesRouter);
  app.use('/leads', leadsRouter);
  app.use('/opportunities', opportunitiesRouter);
  console.log('📌 [SERVER] Registrando rota /tags');
  app.use('/tags', tagsRouter); 
  app.use('/interactions', interactionsRouter);
  app.use('/visits', visitsRouter);
  app.use('/invoices', invoicesRouter);
  app.use('/custom-fields', customFieldsRouter);
  app.use('/apikeys', apiKeysRouter);
  app.use('/webhooks', webhooksRouter); // Webhooks não devem ter rate limit (vêm de serviços externos)
  app.use('/webhooks', paymentWebhooksRouter); // /webhooks/payments
  app.use('/checkout', checkoutRouter);

  // Mount interactive API documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

  // Serve raw YAML spec for download/integration tools
  app.get('/openapi.yaml', (_req, res) => {
    if (!openapiYamlPath) {
      res.status(404).send('openapi.yaml not available');
      return;
    }
    try {
      const yamlText = fs.readFileSync(openapiYamlPath, 'utf8');
      res.type('text/yaml').send(yamlText);
    } catch (err) {
      res.status(404).send('openapi.yaml not available');
    }
  });

  // TODO: mount routes for tenants, users, properties, crm, saas

  return app;
};

export default createServer;
