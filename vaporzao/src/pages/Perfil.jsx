import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/api'
import './Perfil.css'

export default function Perfil() {
  const { matricula } = useParams()
  const [perfil, setPerfil] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    api.getPerfil(matricula)
      .then(setPerfil)
      .catch(() => setErro('Usuário não encontrado.'))
  }, [matricula])

  if (erro) return <p className="error-msg">{erro}</p>
  if (!perfil) return <div className="spinner" />

  return (
    <div className="perfil-page">
      <div className="perfil-header card">
        <div className="perfil-avatar">{perfil.nome?.[0]?.toUpperCase() ?? '?'}</div>
        <div>
          <h1 className="perfil-nome">{perfil.nome}</h1>
          <p className="perfil-matricula">Matrícula: {perfil.matricula}</p>
          <p className="perfil-role">{perfil.role === 'ADMIN' ? '👑 Admin' : '🎮 Aluno'}</p>
        </div>
        <div className="perfil-stats">
          <div><strong>{perfil._count?.jogosCriados ?? 0}</strong><span>Jogos</span></div>
          <div><strong>{perfil._count?.reviews ?? 0}</strong><span>Reviews</span></div>
          <div><strong>{perfil._count?.biblioteca ?? 0}</strong><span>Biblioteca</span></div>
          <div><strong>{perfil._count?.wishlist ?? 0}</strong><span>Wishlist</span></div>
        </div>
      </div>

      {perfil.jogosCriados?.length > 0 && (
        <section className="perfil-section">
          <h2 className="section-title">Jogos Criados</h2>
          <div className="perfil-jogos">
            {perfil.jogosCriados.map(j => (
              <Link key={j.id} to={`/jogos/${j.id}`} className="perfil-jogo-card card">
                {j.capaUrl
                  ? <img src={j.capaUrl} alt={j.titulo} />
                  : <div className="perfil-no-img">♨️</div>
                }
                <div className="perfil-jogo-body">
                  <strong>{j.titulo}</strong>
                  <span>R$ {j.preco?.toFixed(2).replace('.', ',') ?? '0,00'}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {perfil.reviews?.length > 0 && (
        <section className="perfil-section">
          <h2 className="section-title">Últimas Reviews</h2>
          <div className="perfil-reviews">
            {perfil.reviews.map(r => (
              <div key={r.id} className="perfil-review card">
                <div className="perfil-review-header">
                  <Link to={`/jogos/${r.jogo?.id}`} className="perfil-review-jogo">{r.jogo?.titulo}</Link>
                  <span className="badge-score">{r.nota}/10</span>
                  <span className={r.recomenda ? 'rec-sim' : 'rec-nao'}>{r.recomenda ? '👍' : '👎'}</span>
                </div>
                <span className="review-data">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
