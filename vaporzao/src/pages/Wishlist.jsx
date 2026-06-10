import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import './Wishlist.css'

export default function Wishlist() {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [removendo, setRemovendoId] = useState(null)

  const carregar = async () => {
    try {
      setItens(await api.getWishlist())
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const remover = async (jogoId) => {
    setRemovendoId(jogoId)
    try {
      await api.removerWishlist(jogoId)
      setItens(prev => prev.filter(i => i.jogo.id !== jogoId))
    } finally {
      setRemovendoId(null)
    }
  }

  const adicionarBiblioteca = async (jogoId) => {
    try {
      await api.adicionarBiblioteca(jogoId)
      await api.removerWishlist(jogoId)
      setItens(prev => prev.filter(i => i.jogo.id !== jogoId))
    } catch (err) {
      alert(err.message)
    }
  }

  if (carregando) return <div className="spinner" />

  return (
    <div>
      <h1 className="page-title">Lista de Desejos</h1>

      {itens.length === 0
        ? <p className="empty-state">Sua lista de desejos está vazia. <Link to="/jogos">Explore a loja!</Link></p>
        : (
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
                    <button className="btn-green btn-sm" onClick={() => adicionarBiblioteca(jogo.id)}>
                      + Biblioteca
                    </button>
                    <button
                      className="btn-danger btn-sm"
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
    </div>
  )
}
