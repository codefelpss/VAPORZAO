import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './GameCard.css'

export default function GameCard({ jogo }) {
  const preco = typeof jogo.preco === 'number'
    ? (jogo.preco === 0 ? 'Grátis' : `R$ ${jogo.preco.toFixed(2).replace('.', ',')}`)
    : '—'

  const nota = jogo.mediaNotas != null
    ? jogo.mediaNotas.toFixed(1)
    : null

  const temVideo = jogo.videos?.length > 0
  const hoverTimer = useRef(null)
  const [videoAtivo, setVideoAtivo] = useState(false)

  useEffect(() => {
    return () => clearTimeout(hoverTimer.current)
  }, [])

  const handleMouseEnter = () => {
    if (!temVideo) return
    hoverTimer.current = setTimeout(() => setVideoAtivo(true), 2000)
  }

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current)
    setVideoAtivo(false)
  }

  return (
    <Link
      to={`/jogos/${jogo.id}`}
      className="game-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="game-card-img">
        {jogo.capaUrl
          ? <img src={jogo.capaUrl} alt={jogo.titulo} loading="lazy" />
          : <div className="game-card-no-img">♨️</div>
        }
        {temVideo && videoAtivo && (
          <video
            key="preview"
            src={jogo.videos[0].url}
            autoPlay
            muted
            loop
            playsInline
            className="game-card-video"
          />
        )}
      </div>
      <div className="game-card-body">
        <p className="game-card-title">{jogo.titulo}</p>
        <p className="game-card-dev">{jogo.desenvolvedora}</p>
        {jogo.generos?.length > 0 && (
          <div className="game-card-genres">
            {jogo.generos.slice(0, 2).map(g => (
              <span key={g.id} className="tag">{g.nome}</span>
            ))}
          </div>
        )}
        <div className="game-card-footer">
          <span className="game-card-price">{preco}</span>
          {nota && <span className="badge-score">{nota}</span>}
        </div>
      </div>
    </Link>
  )
}
