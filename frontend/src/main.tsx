import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      // Best-effort service worker registration: never block initial render.
      navigator.serviceWorker.register('/sw.js').catch(() => {
        console.warn('Service worker registration failed.');
      });
    } catch {
      // Ignore.
    }
  });
}







ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>

    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

