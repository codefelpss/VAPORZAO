import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { usuario, carregando } = useAuth()

  if (carregando) return <div className="spinner" />
  if (!usuario) return <Navigate to="/login" replace />
  return children
}
