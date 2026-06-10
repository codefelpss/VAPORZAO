import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import { cachearTotal } from '../utils/conquistas'
import { triggerCelebration } from '../utils/celebrateEffect'
import './Jogo.css'

function getRaridade(pontos) {
  if (pontos >= 800) return { nome: 'Lendária', cor: '#f1c40f', icone: '🏆' }
  if (pontos >= 500) return { nome: 'Épica',    cor: '#9b59b6', icone: '💎' }
  if (pontos >= 300) return { nome: 'Rara',     cor: '#3498db', icone: '💠' }
  if (pontos >= 100) return { nome: 'Incomum',  cor: '#2ecc71', icone: '✨' }
  return                     { nome: 'Comum',   cor: '#95a5a6', icone: '⭐' }
}

function ReviewForm({ jogoId, onCriada }) {
  const [nota, setNota] = useState(7)
  const [texto, setTexto] = useState('')
  const [recomenda, setRecomenda] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await api.criarReview(jogoId, { nota: Number(nota), texto, recomenda })
      setTexto('')
      setNota(7)
      onCriada()
    } catch (err) {
      setErro(err.message || 'Erro ao enviar review.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Escrever Review</h3>
      <div className="review-form-row">
        <div>
          <label>Nota (0–10)</label>
          <input type="number" min={0} max={10} value={nota} onChange={e => setNota(e.target.value)} required />
        </div>
        <div className="recomenda-field">
          <label>Recomenda?</label>
          <div className="recomenda-btns">
            <button type="button" className={recomenda ? 'btn-green' : 'btn-ghost'} onClick={() => setRecomenda(true)}>👍 Sim</button>
            <button type="button" className={!recomenda ? 'btn-danger' : 'btn-ghost'} onClick={() => setRecomenda(false)}>👎 Não</button>
          </div>
        </div>
      </div>
      <div>
        <label>Texto</label>
        <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={3} required maxLength={2000} />
      </div>
      {erro && <p className="error-msg">{erro}</p>}
      <button type="submit" className="btn-primary" disabled={enviando}>
        {enviando ? 'Enviando...' : 'Publicar Review'}
      </button>
    </form>
  )
}

export default function Jogo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [jogo, setJogo] = useState(null)
  const [status, setStatus] = useState(null)
  const [reviews, setReviews] = useState([])
  const [erro, setErro] = useState(null)
  const [acaoMsg, setAcaoMsg] = useState('')
  const [lightboxIdx, setLightboxIdx] = useState(null)

  const media = [
    ...(jogo?.imagens ?? []).map(img => ({ ...img, tipo: 'imagem' })),
    ...(jogo?.videos  ?? []).map(vid => ({ ...vid, tipo: 'video'  })),
  ]

  const carregar = async () => {
    try {
      const [j, r] = await Promise.all([api.getJogo(id), api.getReviews(id)])
      setJogo(j)
      setReviews(r)
      cachearTotal(j.id, (j.conquistas ?? []).length)
    } catch {
      setErro('Jogo não encontrado.')
    }
  }

  const carregarStatus = async () => {
    if (!usuario) return
    try { setStatus(await api.statusJogo(id)) } catch {}
  }

  useEffect(() => { carregar() }, [id])
  useEffect(() => { carregarStatus() }, [id, usuario])

  useEffect(() => {
    if (lightboxIdx === null) return
    const fn = (e) => {
      if (e.key === 'Escape')      setLightboxIdx(null)
      if (e.key === 'ArrowLeft')   setLightboxIdx(i => (i - 1 + media.length) % media.length)
      if (e.key === 'ArrowRight')  setLightboxIdx(i => (i + 1) % media.length)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [lightboxIdx, media.length])

  const msgTemp = (msg) => {
    setAcaoMsg(msg)
    setTimeout(() => setAcaoMsg(''), 2500)
  }

  const toggleBiblioteca = async (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    try {
      if (status?.naBiblioteca) {
        await api.removerBiblioteca(id)
        msgTemp('Removido da biblioteca.')
      } else {
        await api.adicionarBiblioteca(id)
        msgTemp('Adicionado à biblioteca!')
        triggerCelebration(r.left + r.width / 2, r.top + r.height / 2)
      }
      carregarStatus()
    } catch (err) { msgTemp(err.message) }
  }

  const toggleWishlist = async (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    try {
      if (status?.naWishlist) {
        await api.removerWishlist(id)
        msgTemp('Removido da lista de desejos.')
      } else {
        await api.adicionarWishlist(id)
        msgTemp('Adicionado à lista de desejos!')
        triggerCelebration(r.left + r.width / 2, r.top + r.height / 2)
      }
      carregarStatus()
    } catch (err) { msgTemp(err.message) }
  }

  if (erro) return <p className="error-msg">{erro}</p>
  if (!jogo) return <div className="spinner" />

  const preco = jogo.preco === 0 ? 'Grátis' : `R$ ${jogo.preco.toFixed(2).replace('.', ',')}`

  return (
    <div className="jogo-page">
      <button className="btn-voltar" onClick={() => navigate(-1)}>← Voltar</button>
      <div className="jogo-hero" style={jogo.capaUrl ? { backgroundImage: `url(${jogo.capaUrl})` } : {}}>
        <div className="jogo-hero-overlay">
          <h1 className="jogo-titulo">{jogo.titulo}</h1>
          <p className="jogo-dev">por <Link to={`/perfil/${jogo.autor?.matricula}`}>{jogo.autor?.nome}</Link></p>
        </div>
      </div>

      <div className="jogo-layout">
        <div className="jogo-main">
          <p className="jogo-desc">{jogo.descricao}</p>

          {media.length > 0 && (
            <section>
              <h2 className="section-title" style={{ marginBottom: 10 }}>Mídia</h2>
              <div className="jogo-imgs">
                {media.map((item, idx) => (
                  item.tipo === 'video'
                    ? (
                      <div key={item.id} className="jogo-vid-thumb" onClick={() => setLightboxIdx(idx)}>
                        <span className="jogo-vid-play">▶</span>
                        {item.titulo && <span className="jogo-vid-label">{item.titulo}</span>}
                      </div>
                    )
                    : (
                      <img
                        key={item.id}
                        src={item.url}
                        alt={item.legenda || jogo.titulo}
                        className="jogo-img-thumb"
                        onClick={() => setLightboxIdx(idx)}
                      />
                    )
                ))}
              </div>
            </section>
          )}

          {jogo.conquistas?.length > 0 && (
            <section>
              <h2 className="section-title" style={{ margin: '20px 0 10px' }}>
                Conquistas ({jogo.conquistas.length})
              </h2>
              <div className="conquistas-grid">
                {jogo.conquistas.map(c => {
                  const rar = getRaridade(c.pontos)
                  return (
                    <Link key={c.id} to={`/conquistas/${c.id}`} className="conquista-card card">
                      <div className="conquista-card-icon" style={{ color: rar.cor }}>
                        {c.iconeUrl
                          ? <img src={c.iconeUrl} alt={c.titulo} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                          : rar.icone}
                      </div>
                      <div className="conquista-card-info">
                        <strong>{c.titulo}</strong>
                        <p>{c.descricao}</p>
                      </div>
                      <div className="conquista-card-footer">
                        <span className="badge-score">{c.pontos} pts</span>
                        <span className="conquista-rar-label" style={{ color: rar.cor }}>{rar.nome}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          <section style={{ marginTop: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>Reviews ({reviews.length})</h2>

            {usuario && !status?.reviewFeita && (
              <ReviewForm jogoId={id} onCriada={() => { carregar(); carregarStatus() }} />
            )}

            {reviews.length === 0
              ? <p className="empty-state" style={{ padding: 20 }}>Nenhuma review ainda. Seja o primeiro!</p>
              : reviews.map(r => (
                <div key={r.id} className="review-card card">
                  <div className="review-header">
                    <span className="badge-score">{r.nota}/10</span>
                    <strong>{r.autor?.nome}</strong>
                    <span className={r.recomenda ? 'rec-sim' : 'rec-nao'}>{r.recomenda ? '👍 Recomenda' : '👎 Não recomenda'}</span>
                  </div>
                  <p className="review-texto">{r.texto}</p>
                  <span className="review-data">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              ))
            }
          </section>
        </div>

        <aside className="jogo-aside">
          <div className="jogo-info-card card">
            {jogo.capaUrl && <img src={jogo.capaUrl} alt={jogo.titulo} className="jogo-capa" />}
            <div className="jogo-info-body">
              <div className="jogo-price">{preco}</div>

              {jogo.generos?.length > 0 && (
                <div className="jogo-tags">
                  {jogo.generos.map(g => <span key={g.id} className="tag">{g.nome}</span>)}
                </div>
              )}

              <div className="jogo-meta">
                <div><span>Desenvolvedora</span><strong>{jogo.desenvolvedora}</strong></div>
                <div><span>Lançamento</span><strong>{new Date(jogo.lancamento).toLocaleDateString('pt-BR')}</strong></div>
                <div><span>Reviews</span><strong>{jogo._count?.reviews ?? 0}</strong></div>
                <div><span>Na biblioteca de</span><strong>{jogo._count?.bibliotecas ?? 0} pessoas</strong></div>
              </div>

              {acaoMsg && <p className="success-msg">{acaoMsg}</p>}

              {usuario && status && (
                <div className="jogo-acoes">
                  <button
                    className={status.naBiblioteca ? 'btn-danger' : 'btn-green'}
                    onClick={toggleBiblioteca}
                    data-no-smoke={!status.naBiblioteca ? true : undefined}
                  >
                    {status.naBiblioteca ? 'Remover da Biblioteca' : '+ Adicionar à Biblioteca'}
                  </button>
                  <button
                    className={status.naWishlist ? 'btn-ghost' : 'btn-ghost'}
                    onClick={toggleWishlist}
                    data-no-smoke={!status.naWishlist ? true : undefined}
                    style={{ borderColor: status.naWishlist ? 'var(--red)' : 'var(--border)', color: status.naWishlist ? 'var(--red)' : 'var(--accent)' }}
                  >
                    {status.naWishlist ? '♥ Remover da Wishlist' : '♡ Lista de Desejos'}
                  </button>
                </div>
              )}

              {usuario && status?.naBiblioteca && (
                <Link to="/area-gamer" style={{ fontSize: 12, color: 'var(--text2)', textAlign: 'center', display: 'block', marginTop: 4 }}>
                  Ver na Área Gamer →
                </Link>
              )}

              {!usuario && (
                <p style={{ fontSize: 12, color: 'var(--text2)', textAlign: 'center', marginTop: 12 }}>
                  <Link to="/login">Entre</Link> para adicionar à biblioteca
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {lightboxIdx !== null && media.length > 0 && (
        <div className="lightbox-backdrop" onClick={() => setLightboxIdx(null)}>
          {media.length > 1 && (
            <button
              className="lightbox-nav lightbox-prev"
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + media.length) % media.length) }}
            >
              ‹
            </button>
          )}

          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            {media[lightboxIdx].tipo === 'video'
              ? (
                <video
                  key={lightboxIdx}
                  src={media[lightboxIdx].url}
                  controls
                  autoPlay
                  className="lightbox-video"
                />
              )
              : (
                <img src={media[lightboxIdx].url} alt={media[lightboxIdx].legenda || ''} />
              )
            }
            {(media[lightboxIdx].legenda || media[lightboxIdx].titulo) && (
              <p className="lightbox-legenda">{media[lightboxIdx].legenda || media[lightboxIdx].titulo}</p>
            )}
            <button className="lightbox-close" onClick={() => setLightboxIdx(null)}>✕</button>
          </div>

          {media.length > 1 && (
            <button
              className="lightbox-nav lightbox-next"
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % media.length) }}
            >
              ›
            </button>
          )}

          {media.length > 1 && (
            <div className="lightbox-counter">{lightboxIdx + 1} / {media.length}</div>
          )}
        </div>
      )}
    </div>
  )
}
