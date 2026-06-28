const axios = require('axios');
const api = axios.create({ baseURL: 'http://localhost:8080/api' });
console.log(api.getUri({ url: '/admin/test' }));
console.log(api.getUri({ url: 'admin/test' }));
