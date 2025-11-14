import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../api/api'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'user'
}

interface UsuarioPerfil {
  _id: string
  nome: string
  email: string
  papel: 'admin' | 'user'
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'admin' 
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verificarAutorizacao = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        // Buscar perfil do usuário
        const response = await api.get<UsuarioPerfil>('/usuarios/perfil')
        const usuario = response.data

        // Verificar se o usuário tem o papel necessário
        if (requiredRole === 'admin') {
          setIsAuthorized(usuario.papel === 'admin')
        } else {
          setIsAuthorized(true) // Se requer 'user', qualquer usuário logado pode acessar
        }
      } catch (error) {
        console.error('Erro ao verificar autorização:', error)
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    verificarAutorizacao()
  }, [requiredRole])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Verificando permissões...
      </div>
    )
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
