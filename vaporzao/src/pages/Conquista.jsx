import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/api'
import './Conquista.css'

function getRaridade(pontos) {
  if (pontos >= 800) return { nome: 'Lendária',  cor: '#f1c40f', bg: '#2d2500', icone: '🏆' }
  if (pontos >= 500) return { nome: 'Épica',      cor: '#9b59b6', bg: '#1e0d2e', icone: '💎' }
  if (pontos >= 300) return { nome: 'Rara',       cor: '#3498db', bg: '#0d1e2e', icone: '💠' }
  if (pontos >= 100) return { nome: 'Incomum',    cor: '#2ecc71', bg: '#0d2018', icone: '✨' }
  return                     { nome: 'Comum',     cor: '#95a5a6', bg: '#1a1e22', icone: '⭐' }
}

export default function Conquista() {
  const { id } = useParams()
  const [conquista, setConquista] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    api.getConquista(id)
      .then(setConquista)
      .catch(() => setErro('Conquista não encontrada.'))
  }, [id])

  if (erro) return <p className="error-msg" style={{ marginTop: 40, textAlign: 'center' }}>{erro}</p>
  if (!conquista) return <div className="spinner" />

  const rar = getRaridade(conquista.pontos)

  return (
    <div className="conquista-page">
      <div className="conquista-breadcrumb">
        {conquista.jogo && (
          <Link to={`/jogos/${conquista.jogo.id}`}>← {conquista.jogo.titulo}</Link>
        )}
      </div>

      <div className="conquista-card-full" style={{ borderColor: rar.cor, background: rar.bg }}>
        <div className="conquista-icone-wrap" style={{ boxShadow: `0 0 40px ${rar.cor}55`, borderColor: rar.cor }}>
          {conquista.iconeUrl
            ? <img src={conquista.iconeUrl} alt={conquista.titulo} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
            : <span className="conquista-icone">{rar.icone}</span>}
        </div>

        <div className="conquista-raridade-badge" style={{ background: rar.cor }}>
          {rar.nome}
        </div>

        <h1 className="conquista-titulo">{conquista.titulo}</h1>

        <p className="conquista-desc">{conquista.descricao}</p>

        <div className="conquista-pontos" style={{ color: rar.cor }}>
          <span className="conquista-pontos-num">{conquista.pontos}</span>
          <span className="conquista-pontos-label">pontos</span>
        </div>

        <div className="conquista-stats">
          <div className="conquista-stat">
            <span style={{ color: rar.cor }}>{rar.icone}</span>
            <span>Raridade</span>
            <strong style={{ color: rar.cor }}>{rar.nome}</strong>
          </div>
          <div className="conquista-stat">
            <span>🎮</span>
            <span>Jogo</span>
            {conquista.jogo
              ? <Link to={`/jogos/${conquista.jogo.id}`} style={{ color: 'var(--accent)' }}>{conquista.jogo.titulo}</Link>
              : <strong>—</strong>
            }
          </div>
          <div className="conquista-stat">
            <span>🏅</span>
            <span>Pontos</span>
            <strong style={{ color: rar.cor }}>{conquista.pontos} pts</strong>
          </div>
        </div>

        <div className="conquista-barra-wrap">
          <div className="conquista-barra-label">
            <span>Dificuldade</span>
            <span style={{ color: rar.cor }}>{rar.nome}</span>
          </div>
          <div className="conquista-barra-bg">
            <div
              className="conquista-barra-fill"
              style={{
                width: `${Math.min((conquista.pontos / 1000) * 100, 100)}%`,
                background: rar.cor
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
