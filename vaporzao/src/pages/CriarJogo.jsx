import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/api'
import JogoForm from '../components/JogoForm'
import '../pages/Estudio.css'

export default function CriarJogo() {
  const navigate = useNavigate()
  const [generos, setGeneros] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api.getGeneros()
      .then(setGeneros)
      .finally(() => setCarregando(false))
  }, [])

  return (
    <div className="estudio-page">
      <div className="estudio-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Link to="/estudio" className="criar-jogo-voltar">← Estúdio</Link>
          </div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>🎮 Novo Jogo</h1>
          <p className="estudio-sub">Preencha os dados do seu jogo</p>
        </div>
      </div>

      <div className="card criar-jogo-card">
        {carregando
          ? <div className="spinner" />
          : (
            <JogoForm
              generosTodos={generos}
              onSalvo={() => navigate('/estudio')}
              onCancelar={() => navigate('/estudio')}
            />
          )
        }
      </div>
    </div>
  )
}
