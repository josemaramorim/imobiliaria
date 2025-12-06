import dotenv from 'dotenv';
dotenv.config(); // Carregar .env ANTES de qualquer outra importação

import { createServer } from './server';

const port = process.env.PORT || 4000;

async function main() {
  const app = await createServer();
  // Bind explicitly to 0.0.0.0 so container platforms (Railway, Heroku, etc.) can expose the port.
  const host = '0.0.0.0';
  app.listen(port, host, () => {
    console.log(`🚀 Server listening on http://${host}:${port}`);
    console.log('🛰️  Public URL (if set):', process.env.RAILWAY_STATIC_URL || process.env.PUBLIC_URL || process.env.VERCEL_URL || 'not-set');
  });
}

main().catch(err => {
  console.error('Fatal error starting server', err);
  process.exit(1);
});
