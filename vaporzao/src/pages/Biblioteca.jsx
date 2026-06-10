import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import './Biblioteca.css'

export default function Biblioteca() {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [removendo, setRemovendoId] = useState(null)

  const carregar = async () => {
    try {
      setItens(await api.getBiblioteca())
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const remover = async (jogoId) => {
    setRemovendoId(jogoId)
    try {
      await api.removerBiblioteca(jogoId)
      setItens(prev => prev.filter(i => i.jogo.id !== jogoId))
    } finally {
      setRemovendoId(null)
    }
  }

  if (carregando) return <div className="spinner" />

  return (
    <div>
      <h1 className="page-title">Minha Biblioteca</h1>

      {itens.length === 0
        ? <p className="empty-state">Sua biblioteca está vazia. <Link to="/jogos">Explore a loja!</Link></p>
        : (
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
                  <p className="bib-data">Adquirido em {new Date(adicionadoEm).toLocaleDateString('pt-BR')}</p>
                  <button
                    className="btn-danger"
                    style={{ marginTop: 8, fontSize: 12, padding: '4px 10px' }}
                    disabled={removendo === jogo.id}
                    onClick={() => remover(jogo.id)}
                  >
                    {removendo === jogo.id ? '...' : 'Remover'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
