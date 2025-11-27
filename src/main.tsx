import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx';
import { CajaProvider } from './context/CajaContext.tsx';
import { RoleProvider } from './context/RoleContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CajaProvider>
        <RoleProvider>
          <App />
        </RoleProvider>
      </CajaProvider>
    </AuthProvider>
  </React.StrictMode>,
)
