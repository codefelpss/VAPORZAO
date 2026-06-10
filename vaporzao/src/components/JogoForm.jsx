import { useState, useRef } from 'react'
import api from '../api/api'

export default function JogoForm({ inicial, generosTodos, onSalvo, onCancelar }) {
  const vazio = {
    titulo: '', descricao: '', preco: '', desenvolvedora: '',
    lancamento: '', capaUrl: '', generoIds: []
  }
  const [form, setForm] = useState(inicial ?? vazio)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const previewTimer = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(inicial?.capaUrl ?? '')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCapaUrl = (v) => {
    set('capaUrl', v)
    clearTimeout(previewTimer.current)
    previewTimer.current = setTimeout(() => setPreviewUrl(v), 600)
  }

  const toggleGenero = (id) => {
    set('generoIds', form.generoIds.includes(id)
      ? form.generoIds.filter(g => g !== id)
      : [...form.generoIds, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao,
        preco: Number(form.preco),
        desenvolvedora: form.desenvolvedora,
        lancamento: form.lancamento ? new Date(form.lancamento).toISOString() : undefined,
        capaUrl: form.capaUrl || undefined,
        generoIds: form.generoIds,
      }
      if (inicial?.id) {
        await api.editarJogo(inicial.id, payload)
      } else {
        await api.criarJogo(payload)
      }
      onSalvo()
    } catch (err) {
      setErro(err.message || 'Erro ao salvar.')
    } finally {
      setEnviando(false)
    }
  }

  const lancamentoValue = form.lancamento
    ? (form.lancamento.includes('T') ? form.lancamento.slice(0, 10) : form.lancamento)
    : ''

  return (
    <form onSubmit={handleSubmit} className="jogo-form">
      <div className="jogo-form-grid">
        <div className="jogo-form-campos">
          <div className="form-group">
            <label>Título *</label>
            <input value={form.titulo} onChange={e => set('titulo', e.target.value)} required maxLength={200} />
          </div>
          <div className="form-group">
            <label>Desenvolvedora *</label>
            <input value={form.desenvolvedora} onChange={e => set('desenvolvedora', e.target.value)} required maxLength={150} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Preço (R$) *</label>
              <input type="number" min={0} step="0.01" value={form.preco} onChange={e => set('preco', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Data de Lançamento *</label>
              <input type="date" value={lancamentoValue} onChange={e => set('lancamento', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>URL da Capa</label>
            <input
              type="url"
              value={form.capaUrl}
              onChange={e => handleCapaUrl(e.target.value)}
              placeholder="https://exemplo.com/capa.jpg"
            />
          </div>
          <div className="form-group">
            <label>Gêneros</label>
            <div className="generos-checkboxes">
              {generosTodos.map(g => (
                <label key={g.id} className={`genero-chip ${form.generoIds.includes(g.id) ? 'ativo' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.generoIds.includes(g.id)}
                    onChange={() => toggleGenero(g.id)}
                    style={{ display: 'none' }}
                  />
                  {g.nome}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Descrição *</label>
            <textarea
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              rows={5}
              required
              maxLength={5000}
            />
          </div>
          {erro && <p className="error-msg">{erro}</p>}
          <div className="form-acoes">
            <button type="submit" className="btn-primary" disabled={enviando}>
              {enviando ? 'Salvando...' : (inicial?.id ? 'Salvar Alterações' : 'Criar Jogo')}
            </button>
            {onCancelar && (
              <button type="button" className="btn-ghost" onClick={onCancelar}>Cancelar</button>
            )}
          </div>
        </div>

        <div className="jogo-form-preview">
          <p className="preview-label">Preview da Capa</p>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="preview-img"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              onLoad={e => { e.target.style.display = 'block'; e.target.nextSibling.style.display = 'none' }}
            />
          ) : null}
          <div className="preview-placeholder" style={{ display: previewUrl ? 'none' : 'flex' }}>
            <span>🖼️</span>
            <p>Cole uma URL válida para ver o preview</p>
          </div>
        </div>
      </div>
    </form>
  )
}
