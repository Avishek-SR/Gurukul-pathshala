const axios = require('axios');
const api = axios.create({ baseURL: '/api' });
console.log(api.getUri({ url: '/public/settings' }));
console.log(api.getUri({ url: 'public/settings' }));
