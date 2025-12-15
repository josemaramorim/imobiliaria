import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';

// Cleanup old localStorage keys from previous versions and ensure we start
// with a fresh state. We remove any key that starts with `apollo_` in both
// localStorage and sessionStorage to avoid stale sessions.
if (typeof window !== 'undefined') {
  const clearApolloKeys = () => {
    try {
      Object.keys(localStorage).forEach(k => { if (k.startsWith('apollo_')) localStorage.removeItem(k); });
    } catch (e) { /* ignore */ }
    try {
      Object.keys(sessionStorage).forEach(k => { if (k.startsWith('apollo_')) sessionStorage.removeItem(k); });
    } catch (e) { /* ignore */ }
    // also ensure apollo_current_tenant is removed explicitly
    try { sessionStorage.removeItem('apollo_current_tenant'); } catch (e) { /* ignore */ }
    console.debug('[Init] Cleared old apollo_* keys and apollo_current_tenant from storages');
  };

  // Expose for runtime checks (tests or other modules can call `window.clearApolloKeys()`)
  try {
    (window as any).clearApolloKeys = clearApolloKeys;
  } catch (e) { /* ignore */ }

  clearApolloKeys();
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);