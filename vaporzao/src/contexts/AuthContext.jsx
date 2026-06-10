// @refresh reset
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/api'

const defaultCtx = { usuario: null, carregando: true, login: async () => {}, primeiroAcesso: async () => {}, logout: () => {} }
const AuthContext = createContext(defaultCtx)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const carregarUsuario = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) { setCarregando(false); return }
    try {
      const data = await api.me()
      setUsuario(data)
    } catch {
      localStorage.removeItem('token')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregarUsuario() }, [carregarUsuario])

  const login = async (matricula, senha) => {
    const data = await api.login({ matricula, senha })
    localStorage.setItem('token', data.token)
    setUsuario(data.usuario)
    return data.usuario
  }

  const primeiroAcesso = async (matricula, senha) => {
    const data = await api.primeiroAcesso({ matricula, senha })
    localStorage.setItem('token', data.token)
    setUsuario(data.usuario)
    return data.usuario
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, primeiroAcesso, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
