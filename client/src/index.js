/* CACCO Command Platform — entry point (CRA resolves .js before .tsx) */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // resolves to App.tsx (App.js was removed)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
