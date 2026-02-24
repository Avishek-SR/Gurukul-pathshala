import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global fetch override to ensure native fetch calls use VITE_API_URL
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  let [resource, config] = args;
  const baseUrl = import.meta.env.VITE_API_URL;

  if (baseUrl && typeof resource === 'string' && resource.startsWith('/api')) {
    // The VITE_API_URL typically ends with '/api', so we strip the '/api' from the 
    // relative path to prevent duplication like '/api/api/...'
    resource = baseUrl + resource.substring(4);
  }

  return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)