const axios = require('axios');
const api = axios.create({ baseURL: 'https://foo.railway.app/api' });
console.log(api.getUri({ url: '/public/settings' }));
