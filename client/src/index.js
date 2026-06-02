import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Report web vitals to console in dev; wire up to analytics service in production
function sendToAnalytics({ name, value, id }) {
  if (process.env.NODE_ENV !== 'production') return;
  // Example: replace with your analytics endpoint or Sentry/Datadog call
  // fetch('/api/vitals', { method: 'POST', body: JSON.stringify({ name, value, id }) });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
