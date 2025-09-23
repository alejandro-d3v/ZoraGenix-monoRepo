import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Configuración de toast notifications
const toastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#1e293b',
    color: '#f1f5f9',
    border: '1px solid #334155',
    borderRadius: '0.75rem',
    fontSize: '14px',
    maxWidth: '400px'
  },
  success: {
    iconTheme: {
      primary: '#00D4FF',
      secondary: '#1e293b'
    }
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#1e293b'
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster toastOptions={toastOptions} />
    </BrowserRouter>
  </React.StrictMode>,
)