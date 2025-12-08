const axios = require('axios');

const BASE_URL = 'http://localhost:4000';
const ADMIN_EMAIL = 'admin@saas.com';
const ADMIN_PASSWORD = 'admin';

async function login() {
  const resp = await axios.post(`${BASE_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  return resp.data.token;
}

async function testListUsers(token) {
  try {
    const resp = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Listagem de usuários (SUPER_ADMIN):', resp.data);
  } catch (err) {
    console.error('Erro ao listar usuários:', err.response?.data || err.message);
  }
}

(async () => {
  try {
    const token = await login();
    console.log('Token JWT:', token);
    await testListUsers(token);
  } catch (err) {
    console.error('Erro geral:', err);
  }
})();
