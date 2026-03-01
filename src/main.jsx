import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'

// Global handlers to catch errors that might otherwise leave the page blank
// eslint-disable-next-line no-console
window.addEventListener('error', (e) => console.error('window.error:', e.error || e.message || e))
// eslint-disable-next-line no-console
window.addEventListener('unhandledrejection', (e) => console.error('unhandledrejection:', e.reason))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
