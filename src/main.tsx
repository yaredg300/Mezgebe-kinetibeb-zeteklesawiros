import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ArchiveProvider } from './context/ArchiveContext';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ArchiveProvider>
      <App />
    </ArchiveProvider>
  </React.StrictMode>
);
