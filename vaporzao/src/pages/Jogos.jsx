import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/api'
import GameCard from '../components/GameCard'
import './Jogos.css'

const ORDENAR_OPTS = [
  { value: 'recentes', label: 'Mais Recentes' },
  { value: 'lancamento', label: 'Data de Lançamento' },
  { value: 'avaliacao', label: 'Avaliação' },
  { value: 'preco', label: 'Preço' },
  { value: 'titulo', label: 'Título' },
]

export default function Jogos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [resultado, setResultado] = useState(null)
  const [generos, setGeneros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [destaques, setDestaques] = useState(null)

  const pagina = Number(searchParams.get('pagina') || 1)
  const busca = searchParams.get('busca') || ''
  const genero = searchParams.get('genero') || ''
  const ordenar = searchParams.get('ordenar') || 'recentes'
  const direcao = searchParams.get('direcao') || 'desc'

  const [buscaInput, setBuscaInput] = useState(busca)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const params = { pagina, limite: 20, ordenar, direcao }
      if (busca) params.busca = busca
      if (genero) params.genero = genero
      const data = await api.listarJogos(params)
      setResultado(data)
    } catch {
      setResultado(null)
    } finally {
      setCarregando(false)
    }
  }, [pagina, busca, genero, ordenar, direcao])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    api.getGeneros().then(setGeneros).catch(() => {})
    api.destaques().then(setDestaques).catch(() => {})
  }, [])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('pagina')
    setSearchParams(next)
  }

  const setPagina = (p) => {
    const next = new URLSearchParams(searchParams)
    next.set('pagina', p)
    setSearchParams(next)
    window.scrollTo(0, 0)
  }

  const handleBusca = (e) => {
    e.preventDefault()
    setParam('busca', buscaInput.trim())
  }

  const mostrarDestaques = !busca && !genero && pagina === 1

  return (
    <div className="jogos-page">
      <h1 className="page-title">Loja</h1>

      {mostrarDestaques && destaques?.populares?.length > 0 && (
        <section className="jogos-destaques">
          <div className="section-header">
            <h2 className="section-title">🔥 Populares</h2>
          </div>
          <div className="games-grid">
            {destaques.populares.slice(0, 5).map(j => <GameCard key={j.id} jogo={j} />)}
          </div>
        </section>
      )}

      <form onSubmit={handleBusca} className="busca-form">
        <input
          type="text"
          placeholder="Buscar jogos..."
          value={buscaInput}
          onChange={e => setBuscaInput(e.target.value)}
        />
        <button type="submit" className="btn-primary">Buscar</button>
      </form>

      <div className="jogos-layout">
        <aside className="jogos-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section-header">Gênero</div>
            <div className="sidebar-option-list">
              <button
                className={`sidebar-option${!genero ? ' active' : ''}`}
                onClick={() => setParam('genero', '')}
              >
                Todos os gêneros
              </button>
              {generos.map(g => (
                <button
                  key={g.id}
                  className={`sidebar-option${genero === g.nome ? ' active' : ''}`}
                  onClick={() => setParam('genero', g.nome)}
                >
                  {g.nome}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="jogos-main">
          <div className="jogos-resultados-header">
            {resultado && !carregando && (
              <span className="jogos-total">{resultado.total} jogo(s) encontrado(s)</span>
            )}
            <div className="jogos-sort">
              <select value={ordenar} onChange={e => setParam('ordenar', e.target.value)}>
                {ORDENAR_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={direcao} onChange={e => setParam('direcao', e.target.value)}>
                <option value="desc">Decrescente</option>
                <option value="asc">Crescente</option>
              </select>
            </div>
          </div>

          {carregando && <div className="spinner" />}

          {!carregando && resultado && (
            <>
              {resultado.itens.length === 0
                ? <p className="empty-state">Nenhum jogo encontrado.</p>
                : <div className="games-grid">{resultado.itens.map(j => <GameCard key={j.id} jogo={j} />)}</div>
              }

              {resultado.paginas > 1 && (
                <div className="pagination">
                  {Array.from({ length: resultado.paginas }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={p === pagina ? 'active' : ''}
                      onClick={() => setPagina(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
