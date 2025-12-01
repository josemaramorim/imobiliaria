import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
  app.use(cors());
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/tenants', tenantsRouter);
  app.use('/plans', plansRouter);
  app.use('/properties', propertiesRouter);
  app.use('/leads', leadsRouter);
  app.use('/opportunities', opportunitiesRouter);
  app.use('/interactions', interactionsRouter);
  app.use('/visits', visitsRouter);
  app.use('/invoices', invoicesRouter);
  app.use('/apikeys', apiKeysRouter);
  app.use('/webhooks', webhooksRouter);
  app.use('/webhooks', paymentWebhooksRouter); // /webhooks/payments
  app.use('/checkout', checkoutRouter);

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
