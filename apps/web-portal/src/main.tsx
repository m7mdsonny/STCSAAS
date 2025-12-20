import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler to catch and log API errors
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  if (error && typeof error === 'object') {
    // Check if this is the site_integration error
    if (error.pathPrefix === '/site_integration' || error.path === '/template_list') {
      console.error('🔍 SITE_INTEGRATION ERROR DETECTED:', {
        error,
        stack: error.stack || new Error().stack,
        timestamp: new Date().toISOString(),
      });
      
      // Log the call stack to find the source
      console.trace('Call stack for site_integration error:');
      
      // Prevent default error handling to investigate
      event.preventDefault();
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
