import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import GameCard from '../components/GameCard'
import './Home.css'

function Secao({ titulo, jogos, linkTodos }) {
  if (!jogos?.length) return null
  return (
    <section className="home-section">
      <div className="section-header">
        <h2 className="section-title">{titulo}</h2>
        {linkTodos && <Link to={linkTodos} className="ver-todos">Ver todos →</Link>}
      </div>
      <div className="games-grid">
        {jogos.map(j => <GameCard key={j.id} jogo={j} />)}
      </div>
    </section>
  )
}

export default function Home() {
  const [destaques, setDestaques] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    api.destaques()
      .then(setDestaques)
      .catch(() => setErro('Não foi possível carregar os destaques.'))
  }, [])

  if (erro) return <p className="error-msg">{erro}</p>
  if (!destaques) return <div className="spinner" />

  return (
    <div>
      <div className="home-hero">
        <h1>♨️ Vaporzão</h1>
        <p>A loja com mais <span className="pressao-silver">PRESSÃO</span> do mercado</p>
        <Link to="/jogos" className="btn-primary hero-cta">
          Ver Loja Completa
        </Link>
      </div>

      <Secao titulo="🆕 Lançamentos Recentes" jogos={destaques.recentes} linkTodos="/jogos?ordenar=lancamento" />
      <Secao titulo="⭐ Top Avaliados" jogos={destaques.topAvaliados} linkTodos="/jogos?ordenar=avaliacao" />
      <Secao titulo="🔥 Populares" jogos={destaques.populares} linkTodos="/jogos" />
    </div>
  )
}
