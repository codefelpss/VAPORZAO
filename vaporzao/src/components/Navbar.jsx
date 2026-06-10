import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

function vaporClick(e) {
  const el = e.currentTarget
  el.classList.remove('vapor-click')
  void el.offsetWidth
  el.classList.add('vapor-click')
  setTimeout(() => el.classList.remove('vapor-click'), 700)
}

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">♨️ Vaporzão</Link>

        <div className="navbar-links">
          <NavLink to="/jogos" onClick={vaporClick}>Loja</NavLink>
          {usuario && <NavLink to="/area-gamer" onClick={vaporClick}>Área Gamer</NavLink>}
          {usuario && <NavLink to="/estudio" onClick={vaporClick}>Área Dev</NavLink>}
        </div>

        <div className="navbar-user">
          {usuario ? (
            <>
              <Link to={`/perfil/${usuario.matricula}`} className="navbar-username">
                {usuario.nome}
              </Link>
              <button className="btn-ghost" onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '6px 14px', borderRadius: 4, fontSize: 13 }}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
