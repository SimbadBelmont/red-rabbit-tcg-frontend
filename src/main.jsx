import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { PedidoProvider } from './context/PedidoContext'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PedidoProvider>
        <App />
      </PedidoProvider>
    </AuthProvider>
  </StrictMode>,
)
