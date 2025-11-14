import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Carrinho from './Carrinho'
import Login from './componentes/login/login.tsx'
import ListaProdutos from './Listarprodutos.tsx'
import Admin from './componentes/admin/admin.tsx'
import ProtectedRoute from './componentes/ProtectedRoute.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<App/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/produtos" element={<ListaProdutos />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            } 
          />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
