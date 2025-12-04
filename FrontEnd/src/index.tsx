import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Cleanup old localStorage keys from previous versions and ensure we start
// with a fresh state. We remove any key that starts with `apollo_` in both
// localStorage and sessionStorage to avoid stale sessions.
if (typeof window !== 'undefined') {
  // REMOVED: Automatic cleanup of session storage was causing logout on refresh
  // try {
  //   Object.keys(localStorage).forEach(k => { if (k.startsWith('apollo_')) localStorage.removeItem(k); });
  // } catch (e) { /* ignore */ }
  // try {
  //   Object.keys(sessionStorage).forEach(k => { if (k.startsWith('apollo_')) sessionStorage.removeItem(k); });
  // } catch (e) { /* ignore */ }
  console.debug('[Init] Session cleanup skipped to allow persistence');
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