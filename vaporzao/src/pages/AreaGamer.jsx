import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/api'
import JogarModal from '../components/JogarModal'
import { getProgresso, cachearTotal } from '../utils/conquistas'
import './AreaGamer.css'

// ── Progresso de conquistas (lê localStorage) ────────────────────────────────
function BibProgresso({ jogoId }) {
  const [prog, setProg] = useState(() => getProgresso(jogoId))

  useEffect(() => {
    setProg(getProgresso(jogoId))
  }, [jogoId])

  if (!prog) return null

  const zerado = prog.pct === 100 && prog.total > 0

  return (
    <div className="bib-conquistas">
      {zerado ? (
        <div className="bib-vaporizado">
          <span className="bib-vaporizado-icon">♨️</span>
          <span className="bib-vaporizado-texto">VAPORIZADO</span>
          <span className="bib-vaporizado-sub">{prog.total}/{prog.total} conquistas</span>
        </div>
      ) : (
        <>
          <div className="bib-conq-header">
            <span className="bib-conq-label">🏆 Conquistas</span>
            <span className="bib-conq-count">{prog.desbloqueadas}/{prog.total} ({prog.pct}%)</span>
          </div>
          <div className="bib-conq-bar-bg">
            <div className="bib-conq-bar-fill" style={{ width: `${prog.pct}%` }} />
          </div>
        </>
      )}
    </div>
  )
}

// ── Biblioteca ───────────────────────────────────────────────────────────────
function Biblioteca() {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [removendo, setRemovendoId] = useState(null)
  const [jogando, setJogando] = useState(null) // { jogo, horasJogadas }
  const [progressKey, setProgressKey] = useState(0)

  const carregar = async () => {
    setCarregando(true)
    try { setItens(await api.getBiblioteca()) } finally { setCarregando(false) }
  }

  useEffect(() => { carregar() }, [])

  const remover = async (jogoId) => {
    setRemovendoId(jogoId)
    try {
      await api.removerBiblioteca(jogoId)
      setItens(prev => prev.filter(i => i.jogo.id !== jogoId))
    } finally { setRemovendoId(null) }
  }

  const handleSessaoSalva = (jogoId, novasHoras) => {
    setItens(prev => prev.map(i =>
      i.jogo.id === jogoId ? { ...i, horasJogadas: novasHoras } : i
    ))
    setProgressKey(k => k + 1)
    setJogando(null)
  }

  if (carregando) return <div className="spinner" />

  if (itens.length === 0)
    return <p className="empty-state">Sua biblioteca está vazia. <Link to="/jogos">Explore a loja!</Link></p>

  return (
    <>
      {jogando && (
        <JogarModal
          jogo={jogando.jogo}
          horasAtuais={jogando.horasJogadas}
          onFechar={() => setJogando(null)}
          onSalvo={(novasHoras) => handleSessaoSalva(jogando.jogo.id, novasHoras)}
        />
      )}

      <div className="bib-grid">
        {itens.map(({ jogo, horasJogadas, adicionadoEm }) => (
          <div key={jogo.id} className="bib-card card">
            <Link to={`/jogos/${jogo.id}`}>
              {jogo.capaUrl
                ? <img src={jogo.capaUrl} alt={jogo.titulo} className="bib-img" />
                : <div className="bib-img bib-no-img">♨️</div>
              }
            </Link>
            <div className="bib-body">
              <Link to={`/jogos/${jogo.id}`}><strong className="bib-titulo">{jogo.titulo}</strong></Link>
              <p className="bib-dev">{jogo.desenvolvedora}</p>
              <p className="bib-horas">{horasJogadas}h jogadas</p>
              <BibProgresso key={`${jogo.id}-${progressKey}`} jogoId={jogo.id} />
              <p className="bib-data">Adquirido em {new Date(adicionadoEm).toLocaleDateString('pt-BR')}</p>
              <div className="bib-acoes">
                <button
                  className="btn-green bib-btn-jogar"
                  onClick={() => setJogando({ jogo, horasJogadas })}
                >
                  ▶ Jogar
                </button>
                <button
                  className="btn-danger"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  disabled={removendo === jogo.id}
                  onClick={() => remover(jogo.id)}
                >
                  {removendo === jogo.id ? '...' : 'Remover'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Lista de Desejos ─────────────────────────────────────────────────────────
function Wishlist() {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [removendo, setRemovendoId] = useState(null)

  const carregar = async () => {
    setCarregando(true)
    try { setItens(await api.getWishlist()) } finally { setCarregando(false) }
  }

  useEffect(() => { carregar() }, [])

  const remover = async (jogoId) => {
    setRemovendoId(jogoId)
    try {
      await api.removerWishlist(jogoId)
      setItens(prev => prev.filter(i => i.jogo.id !== jogoId))
    } finally { setRemovendoId(null) }
  }

  const adicionarBiblioteca = async (jogoId) => {
    try {
      await api.adicionarBiblioteca(jogoId)
      await api.removerWishlist(jogoId)
      setItens(prev => prev.filter(i => i.jogo.id !== jogoId))
    } catch (err) { alert(err.message) }
  }

  if (carregando) return <div className="spinner" />

  if (itens.length === 0)
    return <p className="empty-state">Sua lista de desejos está vazia. <Link to="/jogos">Explore a loja!</Link></p>

  return (
    <div className="wish-list">
      {itens.map(({ jogo, adicionadoEm }) => {
        const preco = jogo.preco === 0 ? 'Grátis' : `R$ ${jogo.preco.toFixed(2).replace('.', ',')}`
        return (
          <div key={jogo.id} className="wish-item card">
            {jogo.capaUrl
              ? <img src={jogo.capaUrl} alt={jogo.titulo} className="wish-img" />
              : <div className="wish-img wish-no-img">♨️</div>
            }
            <div className="wish-body">
              <Link to={`/jogos/${jogo.id}`}><strong className="wish-titulo">{jogo.titulo}</strong></Link>
              <p className="wish-dev">{jogo.desenvolvedora}</p>
              <p className="wish-data">Adicionado em {new Date(adicionadoEm).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="wish-acoes">
              <span className="wish-preco">{preco}</span>
              <button className="btn-green" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => adicionarBiblioteca(jogo.id)}>
                + Biblioteca
              </button>
              <button
                className="btn-danger"
                style={{ fontSize: 12, padding: '5px 10px' }}
                disabled={removendo === jogo.id}
                onClick={() => remover(jogo.id)}
              >
                {removendo === jogo.id ? '...' : 'Remover'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function AreaGamer() {
  const [searchParams, setSearchParams] = useSearchParams()
  const aba = searchParams.get('aba') || 'biblioteca'

  const setAba = (v) => setSearchParams({ aba: v })

  return (
    <div className="area-gamer-page">
      <div className="area-gamer-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>🎮 Área Gamer</h1>
        <p className="area-gamer-sub">Sua coleção e desejos em um só lugar</p>
      </div>

      <div className="area-gamer-tabs">
        <button
          className={aba === 'biblioteca' ? 'active' : ''}
          onClick={() => setAba('biblioteca')}
        >
          📚 Biblioteca
        </button>
        <button
          className={aba === 'wishlist' ? 'active' : ''}
          onClick={() => setAba('wishlist')}
        >
          ♥ Lista de Desejos
        </button>
      </div>

      <div className="area-gamer-content">
        {aba === 'biblioteca' && <Biblioteca />}
        {aba === 'wishlist'   && <Wishlist />}
      </div>
    </div>
  )
}
