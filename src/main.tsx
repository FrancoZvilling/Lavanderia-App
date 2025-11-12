import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx';
import { CajaProvider } from './context/CajaContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Envolver App con AuthProvider */}
    <AuthProvider>
      <CajaProvider>
        <App />
      </CajaProvider>
    </AuthProvider>
  </React.StrictMode>,
)
