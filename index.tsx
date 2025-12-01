
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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

// Register Service Worker for Offline Support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Only attempt to register if we are in a secure context or localhost
    // and handle errors silently if cross-origin issues arise in previews.
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful');
      })
      .catch((err) => {
        // Suppress noisy errors in preview environments where origin mismatch is common
        console.warn('ServiceWorker registration skipped:', err.message);
      });
  });
}
