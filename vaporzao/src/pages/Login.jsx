import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const [aba, setAba] = useState('login')
  const [matricula, setMatricula] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const { login, primeiroAcesso } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      if (aba === 'login') {
        await login(matricula, senha)
      } else {
        await primeiroAcesso(matricula, senha)
      }
      navigate('/')
    } catch (err) {
      setErro(err.message || 'Credenciais inválidas.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-box card">
        <h1 className="login-title">♨️ Vaporzão</h1>

        <div className="login-tabs">
          <button
            className={aba === 'login' ? 'active' : ''}
            onClick={() => { setAba('login'); setErro('') }}
          >
            Entrar
          </button>
          <button
            className={aba === 'primeiro' ? 'active' : ''}
            onClick={() => { setAba('primeiro'); setErro('') }}
          >
            Primeiro Acesso
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label>Matrícula</label>
            <input
              type="text"
              value={matricula}
              onChange={e => setMatricula(e.target.value)}
              placeholder="Ex: 2024001"
              required
            />
          </div>
          <div>
            <label>{aba === 'primeiro' ? 'Criar Senha' : 'Senha'}</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Mínimo 4 caracteres"
              required
              minLength={4}
            />
          </div>

          {erro && <p className="error-msg">{erro}</p>}

          <button type="submit" className="btn-primary login-btn" disabled={carregando}>
            {carregando ? 'Aguarde...' : (aba === 'login' ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        {aba === 'primeiro' && (
          <p className="login-hint">
            Use no <strong>primeiro login</strong>. Sua matrícula deve ter sido cadastrada pelo professor.
          </p>
        )}
      </div>
    </div>
  )
}
