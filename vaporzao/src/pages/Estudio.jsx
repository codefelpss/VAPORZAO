import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import JogoForm from '../components/JogoForm'
import './Estudio.css'

// ── Painel de conquistas ────────────────────────────────────────────────────
function PainelConquistas({ jogoId, conquistas, onAtualizar }) {
  const [form, setForm] = useState({ titulo: '', descricao: '', pontos: 50, iconeUrl: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await api.criarConquista(jogoId, {
        titulo: form.titulo,
        descricao: form.descricao,
        pontos: Number(form.pontos),
        ...(form.iconeUrl ? { iconeUrl: form.iconeUrl } : {})
      })
      setForm({ titulo: '', descricao: '', pontos: 50, iconeUrl: '' })
      onAtualizar()
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const remover = async (id) => {
    if (!confirm('Remover esta conquista?')) return
    try { await api.deletarConquista(id); onAtualizar() } catch {}
  }

  function getRarLabel(p) {
    if (p >= 800) return '🏆 Lendária'
    if (p >= 500) return '💎 Épica'
    if (p >= 300) return '💠 Rara'
    if (p >= 100) return '✨ Incomum'
    return '⭐ Comum'
  }

  return (
    <div className="painel-section">
      <h3 className="painel-title">Conquistas ({conquistas.length})</h3>

      <form onSubmit={handleSubmit} className="mini-form">
        <div className="form-row">
          <div className="form-group">
            <label>Título *</label>
            <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required maxLength={120} />
          </div>
          <div className="form-group" style={{ maxWidth: 100 }}>
            <label>Pontos</label>
            <input type="number" min={0} max={1000} value={form.pontos} onChange={e => setForm(f => ({ ...f, pontos: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label>Descrição *</label>
          <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} required maxLength={500} />
        </div>
        <div className="form-group">
          <label>URL da Imagem</label>
          <input type="url" value={form.iconeUrl} onChange={e => setForm(f => ({ ...f, iconeUrl: e.target.value }))} placeholder="https://..." maxLength={500} />
          {form.iconeUrl && (
            <img src={form.iconeUrl} alt="preview" className="img-preview-mini"
              onError={e => e.target.style.display='none'}
              onLoad={e => e.target.style.display='block'}
              style={{ marginTop: 6 }}
            />
          )}
        </div>
        {erro && <p className="error-msg">{erro}</p>}
        <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={enviando}>
          {enviando ? '...' : '+ Adicionar Conquista'}
        </button>
      </form>

      <div className="painel-lista">
        {conquistas.length === 0 && <p className="empty-state" style={{ padding: '16px 0' }}>Nenhuma conquista ainda.</p>}
        {conquistas.map(c => (
          <div key={c.id} className="painel-item">
            <Link to={`/conquistas/${c.id}`} className="painel-item-main">
              <span className="painel-item-icon">{getRarLabel(c.pontos).split(' ')[0]}</span>
              <div>
                <strong>{c.titulo}</strong>
                <p>{c.descricao}</p>
              </div>
              <span className="painel-item-pts">{c.pontos} pts</span>
            </Link>
            <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => remover(c.id)}>
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Painel de imagens ───────────────────────────────────────────────────────
function PainelImagens({ jogoId, imagens, onAtualizar }) {
  const [url, setUrl] = useState('')
  const [legenda, setLegenda] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [preview, setPreview] = useState('')
  const timer = useRef(null)

  const handleUrl = (v) => {
    setUrl(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPreview(v), 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    try {
      await api.criarImagem(jogoId, { url, legenda: legenda || undefined, ordem: imagens.length })
      setUrl(''); setLegenda(''); setPreview('')
      onAtualizar()
    } catch {}
    finally { setEnviando(false) }
  }

  const remover = async (id) => {
    if (!confirm('Remover imagem?')) return
    try { await api.deletarImagem(id); onAtualizar() } catch {}
  }

  return (
    <div className="painel-section">
      <h3 className="painel-title">Screenshots ({imagens.length})</h3>

      <form onSubmit={handleSubmit} className="mini-form">
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>URL da Imagem *</label>
            <input type="url" value={url} onChange={e => handleUrl(e.target.value)} required placeholder="https://..." />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Legenda</label>
            <input value={legenda} onChange={e => setLegenda(e.target.value)} maxLength={200} />
          </div>
        </div>
        {preview && (
          <img src={preview} alt="preview" className="img-preview-mini"
            onError={e => e.target.style.display='none'}
            onLoad={e => e.target.style.display='block'}
          />
        )}
        <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={enviando}>
          {enviando ? '...' : '+ Adicionar Screenshot'}
        </button>
      </form>

      <div className="imgs-grid-mini">
        {imagens.map(img => (
          <div key={img.id} className="img-mini-item">
            <img src={img.url} alt={img.legenda || ''} />
            <div className="img-mini-overlay">
              {img.legenda && <p>{img.legenda}</p>}
              <button className="btn-danger" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => remover(img.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Painel de vídeos ────────────────────────────────────────────────────────
function PainelVideos({ jogoId, videos, onAtualizar }) {
  const [form, setForm] = useState({ url: '', titulo: '', thumbnail: '' })
  const [enviando, setEnviando] = useState(false)
  const [preview, setPreview] = useState('')
  const timer = useRef(null)

  const handleUrl = (v) => {
    setForm(f => ({ ...f, url: v }))
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPreview(v), 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    try {
      await api.criarVideo(jogoId, {
        url: form.url,
        titulo: form.titulo || undefined,
        thumbnail: form.thumbnail || undefined,
        ordem: videos.length
      })
      setForm({ url: '', titulo: '', thumbnail: '' }); setPreview('')
      onAtualizar()
    } catch {}
    finally { setEnviando(false) }
  }

  const remover = async (id) => {
    if (!confirm('Remover vídeo?')) return
    try { await api.deletarVideo(id); onAtualizar() } catch {}
  }

  return (
    <div className="painel-section">
      <h3 className="painel-title">Vídeos / Trailers ({videos.length})</h3>

      <form onSubmit={handleSubmit} className="mini-form">
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>URL do Vídeo *</label>
            <input type="url" value={form.url} onChange={e => handleUrl(e.target.value)} required placeholder="https://youtube.com/..." />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Título</label>
            <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} maxLength={200} />
          </div>
        </div>
        <div className="form-group">
          <label>URL da Thumbnail</label>
          <input type="url" value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." />
        </div>
        {preview && (
          <div className="video-preview-mini">
            <a href={preview} target="_blank" rel="noreferrer">🎬 Abrir vídeo: {preview.slice(0, 60)}...</a>
          </div>
        )}
        <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={enviando}>
          {enviando ? '...' : '+ Adicionar Vídeo'}
        </button>
      </form>

      <div className="painel-lista">
        {videos.map(v => (
          <div key={v.id} className="painel-item">
            <div className="painel-item-main">
              {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }} />}
              <div>
                <a href={v.url} target="_blank" rel="noreferrer" className="painel-video-link">
                  🎬 {v.titulo || v.url.slice(0, 50)}
                </a>
              </div>
            </div>
            <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => remover(v.id)}>
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Card de jogo no estúdio ─────────────────────────────────────────────────
function JogoEstudio({ jogo, generosTodos, onAtualizar }) {
  const [aba, setAba] = useState(null) // null | 'editar' | 'conquistas' | 'imagens' | 'videos'
  const [jogoCompleto, setJogoCompleto] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const abrir = async (novaAba) => {
    if (aba === novaAba) { setAba(null); return }
    setAba(novaAba)
    if (novaAba !== 'editar' && !jogoCompleto) {
      setCarregando(true)
      try { setJogoCompleto(await api.getJogo(jogo.id)) } catch {}
      finally { setCarregando(false) }
    }
  }

  const recarregar = async () => {
    try { setJogoCompleto(await api.getJogo(jogo.id)) } catch {}
    onAtualizar()
  }

  const excluir = async () => {
    if (!confirm(`Excluir "${jogo.titulo}"? Esta ação é irreversível.`)) return
    try { await api.deletarJogo(jogo.id); onAtualizar() } catch (err) { alert(err.message) }
  }

  return (
    <div className="estudio-jogo-card card">
      <div className="estudio-jogo-header">
        <Link to={`/jogos/${jogo.id}`}>
          {jogo.capaUrl
            ? <img src={jogo.capaUrl} alt={jogo.titulo} className="estudio-jogo-capa" />
            : <div className="estudio-jogo-capa estudio-no-capa">♨️</div>
          }
        </Link>
        <div className="estudio-jogo-info">
          <Link to={`/jogos/${jogo.id}`}><strong className="estudio-jogo-titulo">{jogo.titulo}</strong></Link>
          <p className="estudio-jogo-dev">{jogo.desenvolvedora}</p>
          <p className="estudio-jogo-preco">
            {jogo.preco === 0 ? 'Grátis' : `R$ ${jogo.preco.toFixed(2).replace('.', ',')}`}
          </p>
          {jogo.generos?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {jogo.generos.map(g => <span key={g.id} className="tag">{g.nome}</span>)}
            </div>
          )}
        </div>
        <div className="estudio-jogo-acoes">
          <button className={`btn-ghost ${aba === 'editar' ? 'ativo' : ''}`} onClick={() => abrir('editar')}>✏️ Editar</button>
          <button className={`btn-ghost ${aba === 'conquistas' ? 'ativo' : ''}`} onClick={() => abrir('conquistas')}>🏆 Conquistas</button>
          <button className={`btn-ghost ${aba === 'imagens' ? 'ativo' : ''}`} onClick={() => abrir('imagens')}>🖼️ Imagens</button>
          <button className={`btn-ghost ${aba === 'videos' ? 'ativo' : ''}`} onClick={() => abrir('videos')}>🎬 Vídeos</button>
          <button className="btn-danger" onClick={excluir}>🗑️ Excluir</button>
        </div>
      </div>

      {aba && (
        <div className="estudio-painel">
          {carregando && <div className="spinner" style={{ margin: '20px auto' }} />}

          {!carregando && aba === 'editar' && (
            <JogoForm
              inicial={{ ...jogo, generoIds: jogo.generos?.map(g => g.id) ?? [] }}
              generosTodos={generosTodos}
              onSalvo={() => { setAba(null); onAtualizar() }}
              onCancelar={() => setAba(null)}
            />
          )}

          {!carregando && aba === 'conquistas' && jogoCompleto && (
            <PainelConquistas jogoId={jogo.id} conquistas={jogoCompleto.conquistas ?? []} onAtualizar={recarregar} />
          )}

          {!carregando && aba === 'imagens' && jogoCompleto && (
            <PainelImagens jogoId={jogo.id} imagens={jogoCompleto.imagens ?? []} onAtualizar={recarregar} />
          )}

          {!carregando && aba === 'videos' && jogoCompleto && (
            <PainelVideos jogoId={jogo.id} videos={jogoCompleto.videos ?? []} onAtualizar={recarregar} />
          )}
        </div>
      )}
    </div>
  )
}

// ── Página principal ────────────────────────────────────────────────────────
export default function Estudio() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [jogos, setJogos] = useState([])
  const [generos, setGeneros] = useState([])
  const [carregando, setCarregando] = useState(true)

  const carregar = async () => {
    setCarregando(true)
    try {
      const [js, gs] = await Promise.all([
        api.getPerfil(usuario.matricula).then(p => p.jogosCriados ?? []),
        api.getGeneros()
      ])
      setJogos(js)
      setGeneros(gs)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { if (usuario) carregar() }, [usuario])

  if (carregando) return <div className="spinner" />

  return (
    <div className="estudio-page">
      <div className="estudio-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>🎮 Estúdio</h1>
          <p className="estudio-sub">Gerencie seus jogos, conquistas e mídia</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/estudio/novo')}>
          + Novo Jogo
        </button>
      </div>

      <div className="estudio-games-header">
        <h2 className="section-title">Jogos Criados</h2>
        <span className="estudio-limite">
         ({jogos.length}/3)
        </span>
      </div>

      {jogos.length === 0 ? (
        <p className="empty-state">Você ainda não criou nenhum jogo. Clique em "Novo Jogo" para começar!</p>
      ) : (
        <div className="estudio-jogos-lista">
          {jogos.map(j => (
            <JogoEstudio key={j.id} jogo={j} generosTodos={generos} onAtualizar={carregar} />
          ))}
        </div>
      )}
    </div>
  )
}
