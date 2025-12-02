import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
// usersRouter already imported above
import tenantsRouter from './routes/tenants';
import plansRouter from './routes/plans';
import propertiesRouter from './routes/properties';
import leadsRouter from './routes/leads';
import opportunitiesRouter from './routes/opportunities';
import interactionsRouter from './routes/interactions';
import visitsRouter from './routes/visits';
import invoicesRouter from './routes/invoices';
import apiKeysRouter from './routes/apikeys';
import webhooksRouter from './routes/webhooks';
import checkoutRouter from './routes/checkout';
import paymentWebhooksRouter from './routes/paymentWebhooks';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
const openapiJson: any = require('./openapi.json');
let openapiSpec: any = openapiJson;
try {
  const text = fs.readFileSync(__dirname + '/openapi.yaml', 'utf8');
  if (text && text.trim().length > 0) {
    openapiSpec = yaml.load(text);
  }
} catch (err) {
  console.warn('openapi.yaml not found or parse failed, falling back to openapi.json');
}
import usersRouter from './routes/users';

dotenv.config();

export const createServer = async () => {
  const app = express();

  // Configuração de CORS com whitelist de origens permitidas
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id']
  }));

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
  app.use('/auth', authLimiter, authRouter);
  // Aplicar rate limiting geral em todas as rotas da API
  app.use('/users', apiLimiter, usersRouter);
  app.use('/tenants', apiLimiter, tenantsRouter);
  app.use('/plans', apiLimiter, plansRouter);
  app.use('/properties', apiLimiter, propertiesRouter);
  app.use('/leads', apiLimiter, leadsRouter);
  app.use('/opportunities', apiLimiter, opportunitiesRouter);
  app.use('/interactions', apiLimiter, interactionsRouter);
  app.use('/visits', apiLimiter, visitsRouter);
  app.use('/invoices', apiLimiter, invoicesRouter);
  app.use('/apikeys', apiLimiter, apiKeysRouter);
  app.use('/webhooks', webhooksRouter); // Webhooks não devem ter rate limit (vêm de serviços externos)
  app.use('/webhooks', paymentWebhooksRouter); // /webhooks/payments
  app.use('/checkout', apiLimiter, checkoutRouter);

  // Mount interactive API documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

  // Serve raw YAML spec for download/integration tools
  app.get('/openapi.yaml', (_req, res) => {
    try {
      const yamlText = fs.readFileSync(__dirname + '/openapi.yaml', 'utf8');
      res.type('text/yaml').send(yamlText);
    } catch (err) {
      res.status(404).send('openapi.yaml not available');
    }
  });

  // TODO: mount routes for tenants, users, properties, crm, saas

  return app;
};

export default createServer;
