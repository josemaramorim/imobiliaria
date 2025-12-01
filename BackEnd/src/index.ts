import { createServer } from './server';

const port = process.env.PORT || 4000;

async function main() {
  const app = await createServer();
  app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
}

main().catch(err => {
  console.error('Fatal error starting server', err);
  process.exit(1);
});
