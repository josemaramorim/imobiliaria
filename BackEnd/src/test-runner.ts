import createServer from './server';

(async function main(){
  try{
    const app = await createServer();
    const server = app.listen(0, async () => {
      // get actual port
      // @ts-ignore
      const port = server.address().port;
      console.log('Test server listening on port', port);

      const base = `http://localhost:${port}`;
      // Use global fetch (Node 18+)
      const fetch = globalThis.fetch as any;

      console.log('Calling /health...');
      const h = await fetch(base + '/health');
      console.log('health status', h.status, await h.text());

      console.log('Login as seeded admin...');
      const login = await fetch(base + '/auth/login', {
        method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email: 'admin@apollo.example', password: 'password' })
      });
      console.log('login status', login.status);
      const loginJson = await login.json().catch(()=>null);
      console.log('login body', loginJson);

      if (loginJson && loginJson.token) {
        console.log('Trying /users/me with token...');
        const u = await fetch(base + '/users/me', { headers: { Authorization: `Bearer ${loginJson.token}` } });
        console.log('/users/me status', u.status, await u.text());
      }

      server.close(() => { console.log('Test server closed'); process.exit(0); });
    });
  } catch (err) {
    console.error('test-runner failed', err);
    process.exit(1);
  }
})();
