import { useEffect, useRef, useState } from 'react'
import api from '../api/api'
import { cachearTotal, desbloquear, getDesbloqueadas, sortearParaDesbloquear } from '../utils/conquistas'

function triggerVaporBurst() {
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div')
    p.className = 'smoke-particle'
    const size = Math.random() * 55 + 15
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * 260 + 60
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist - 120
    const duration = Math.random() * 800 + 800
    const delay = Math.random() * 500
    p.style.cssText = `left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;filter:blur(${Math.random()*10+4}px);animation-duration:${duration}ms;animation-delay:${delay}ms;`
    p.style.setProperty('--sx', `calc(-50% + ${dx}px)`)
    p.style.setProperty('--sy', `calc(-50% + ${dy}px)`)
    document.body.appendChild(p)
    setTimeout(() => p.remove(), duration + delay + 50)
  }
}
import './JogarModal.css'

function fmt(seg) {
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function fmtResumo(seg) {
  if (seg < 60) return `${seg} segundo${seg !== 1 ? 's' : ''}`
  const m = Math.floor(seg / 60)
  const h = Math.floor(m / 60)
  const rm = m % 60
  if (h > 0) return rm > 0 ? `${h}h ${rm}min` : `${h}h`
  return `${m} min`
}

function calcHoras(seg) {
  return Math.max(1, seg)
}

function getRarLabel(p) {
  if (p >= 800) return '🏆'
  if (p >= 500) return '💎'
  if (p >= 300) return '💠'
  if (p >= 100) return '✨'
  return '⭐'
}

const LOADING_MSGS = [
  'Iniciando motor de jogo...',
  'Carregando assets...',
  'Conectando aos servidores...',
  'Preparando mundo virtual...',
  'Quase lá...',
]

// ── Toast de conquista desbloqueada ──────────────────────────────────────────
function ToastConquista({ conquistas, onDone }) {
  const [idx, setIdx] = useState(0)
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSaindo(true)
      setTimeout(() => {
        setSaindo(false)
        if (idx + 1 >= conquistas.length) {
          onDone()
        } else {
          setIdx(i => i + 1)
        }
      }, 400)
    }, 2400)
    return () => clearTimeout(timer)
  }, [idx])

  if (!conquistas.length) return null
  const c = conquistas[idx]

  return (
    <div className={`jm-toast ${saindo ? 'saindo' : ''}`}>
      <span className="jm-toast-icon">{getRarLabel(c.pontos)}</span>
      <div className="jm-toast-body">
        <span className="jm-toast-label">Conquista desbloqueada!</span>
        <strong className="jm-toast-titulo">{c.titulo}</strong>
        <span className="jm-toast-pts">+{c.pontos} pts</span>
      </div>
    </div>
  )
}

export default function JogarModal({ jogo, horasAtuais, onFechar, onSalvo }) {
  const [estado, setEstado] = useState('loading')
  const [segundos, setSegundos] = useState(0)
  const [loadMsg, setLoadMsg] = useState(0)
  const [loadPct, setLoadPct] = useState(0)
  const [erro, setErro] = useState('')
  const [conquistasJogo, setConquistasJogo] = useState([])
  const [conquistasGanhas, setConquistasGanhas] = useState([]) // desbloqueadas nesta sessão
  const [mostraToast, setMostraToast] = useState(false)

  const intervalRef = useRef(null)
  const loadRef    = useRef(null)
  const segundosRef = useRef(0)

  // Busca conquistas do jogo ao montar
  useEffect(() => {
    api.getJogo(jogo.id)
      .then(j => {
        const lista = j.conquistas ?? []
        setConquistasJogo(lista)
        cachearTotal(jogo.id, lista.length)
      })
      .catch(() => {})
  }, [jogo.id])

  // Loading falso
  useEffect(() => {
    if (estado !== 'loading') return
    let pct = 0
    let msgIdx = 0
    loadRef.current = setInterval(() => {
      pct += Math.random() * 18 + 4
      msgIdx = Math.min(Math.floor(pct / 20), LOADING_MSGS.length - 1)
      setLoadPct(Math.min(pct, 98))
      setLoadMsg(msgIdx)
      if (pct >= 100) {
        clearInterval(loadRef.current)
        setLoadPct(100)
        setTimeout(() => setEstado('playing'), 400)
      }
    }, 300)
    return () => clearInterval(loadRef.current)
  }, [estado])

  // Timer
  useEffect(() => {
    if (estado === 'playing') {
      intervalRef.current = setInterval(() => setSegundos(s => s + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [estado])

  // Sincroniza ref de segundos para uso no intervalo de conquistas
  useEffect(() => { segundosRef.current = segundos }, [segundos])

  // Conquistas durante o jogo: verifica a cada 5 segundos (= 5h de jogo)
  useEffect(() => {
    if (estado !== 'playing' || conquistasJogo.length === 0) return
    const id = setInterval(() => {
      const sorteadas = sortearParaDesbloquear(conquistasJogo, segundosRef.current, jogo.id)
      const novas = sorteadas.filter(c => desbloquear(jogo.id, c.id))
      if (novas.length > 0) {
        setConquistasGanhas(prev => [...prev, ...novas])
        setMostraToast(true)
        if (getDesbloqueadas(jogo.id).size >= conquistasJogo.length) triggerVaporBurst()
      }
    }, 5000)
    return () => clearInterval(id)
  }, [estado, conquistasJogo, jogo.id])

  // ESC pausa
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (estado === 'playing') setEstado('paused')
        else if (estado === 'paused') setEstado('playing')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [estado])

  const sair = () => {
    // Sorteia conquistas ao sair
    if (conquistasJogo.length > 0) {
      const sorteadas = sortearParaDesbloquear(conquistasJogo, segundos, jogo.id)
      const novas = sorteadas.filter(c => desbloquear(jogo.id, c.id))
      if (novas.length > 0) {
        setConquistasGanhas(prev => [...prev, ...novas])
        setMostraToast(true)
        if (getDesbloqueadas(jogo.id).size >= conquistasJogo.length) triggerVaporBurst()
        setTimeout(() => setEstado('resumo'), novas.length * 2800 + 200)
        return
      }
    }
    setEstado('resumo')
  }

  const salvar = async () => {
    setEstado('salvando')
    setErro('')
    try {
      const novasHoras = horasAtuais + calcHoras(segundos)
      await api.atualizarHoras(jogo.id, novasHoras)
      setEstado('salvo')
      setTimeout(() => onSalvo(novasHoras), 1400)
    } catch (err) {
      setErro(err.message || 'Erro ao salvar.')
      setEstado('resumo')
    }
  }

  const horasAdicionar = calcHoras(segundos)

  return (
    <div className="jm-backdrop" onClick={estado === 'paused' ? () => setEstado('playing') : undefined}>
      <div className="jm-modal" onClick={e => e.stopPropagation()}>

        {jogo.capaUrl && <div className="jm-bg" style={{ backgroundImage: `url(${jogo.capaUrl})` }} />}
        <div className="jm-overlay" />

        {/* Toast de conquista */}
        {mostraToast && conquistasGanhas.length > 0 && (
          <ToastConquista
            conquistas={conquistasGanhas}
            onDone={() => setMostraToast(false)}
          />
        )}

        {/* LOADING */}
        {estado === 'loading' && (
          <div className="jm-content jm-loading">
            <div className="jm-game-icon">
              {jogo.capaUrl ? <img src={jogo.capaUrl} alt={jogo.titulo} /> : <span>♨️</span>}
            </div>
            <h2 className="jm-titulo">{jogo.titulo}</h2>
            <p className="jm-load-msg">{LOADING_MSGS[loadMsg]}</p>
            <div className="jm-progress-bg">
              <div className="jm-progress-fill" style={{ width: `${loadPct}%` }} />
            </div>
            <p className="jm-load-pct">{Math.round(loadPct)}%</p>
          </div>
        )}

        {/* PLAYING */}
        {estado === 'playing' && (
          <div className="jm-content jm-playing">
            <div className="jm-pulse-ring" />
            <div className="jm-status-badge">🎮 Em jogo</div>
            <h2 className="jm-titulo">{jogo.titulo}</h2>
            <div className="jm-timer">{fmt(segundos * 3600)}</div>
            <p className="jm-timer-label">tempo de jogo</p>
            {conquistasJogo.length > 0 ? (
              <p className="jm-conquista-hint">
                🏆 {conquistasJogo.length} conquista{conquistasJogo.length !== 1 ? 's' : ''} disponíve{conquistasJogo.length !== 1 ? 'is' : 'l'} — jogue para desbloquear!
              </p>
            ) : (
              <p className="jm-conquista-hint">Não há conquistas para este jogo.</p>
            )}
            <p className="jm-esc-hint">Pressione <kbd>ESC</kbd> para pausar</p>
            <div className="jm-acoes">
              <button className="btn-ghost" onClick={() => setEstado('paused')}>⏸ Pausar</button>
              <button className="btn-danger" onClick={sair}>✕ Sair do Jogo</button>
            </div>
          </div>
        )}

        {/* PAUSADO */}
        {estado === 'paused' && (
          <div className="jm-content jm-paused">
            <div className="jm-pause-icon">⏸</div>
            <h2 className="jm-titulo">Pausado</h2>
            <p className="jm-timer jm-timer-muted">{fmt(segundos * 3600)}</p>
            <p className="jm-timer-label">tempo de jogo pausado</p>
            <p className="jm-esc-hint">Clique fora ou pressione <kbd>ESC</kbd> para retomar</p>
            <div className="jm-acoes">
              <button className="btn-primary" onClick={() => setEstado('playing')}>▶ Retomar</button>
              <button className="btn-danger" onClick={sair}>✕ Sair do Jogo</button>
            </div>
          </div>
        )}

        {/* RESUMO */}
        {(estado === 'resumo' || estado === 'salvando') && (
          <div className="jm-content jm-resumo">
            <div className="jm-resumo-icon">🏁</div>
            <h2 className="jm-titulo">Sessão encerrada</h2>

            <div className="jm-resumo-stats">
              <div className="jm-stat-box">
                <span className="jm-stat-label">⏱ Jogou agora</span>
                <strong className="jm-stat-val">{fmtResumo(segundos * 3600)}</strong>
              </div>
              <div className="jm-stat-box">
                <span className="jm-stat-label">📊 Total atual</span>
                <strong className="jm-stat-val">{horasAtuais}h</strong>
              </div>
              <div className="jm-stat-box jm-stat-destaque">
                <span className="jm-stat-label">✅ Após salvar</span>
                <strong className="jm-stat-val">{horasAtuais + horasAdicionar}h</strong>
              </div>
            </div>

            {conquistasGanhas.length > 0 && (
              <div className="jm-conquistas-ganhas">
                <p className="jm-cg-titulo">🏆 {conquistasGanhas.length} conquista{conquistasGanhas.length !== 1 ? 's' : ''} desbloqueada{conquistasGanhas.length !== 1 ? 's' : ''}!</p>
                {conquistasGanhas.map(c => (
                  <div key={c.id} className="jm-cg-item">
                    <span>{getRarLabel(c.pontos)}</span>
                    <span>{c.titulo}</span>
                    <span className="jm-cg-pts">+{c.pontos} pts</span>
                  </div>
                ))}
              </div>
            )}

            {segundos < 2 && (
              <p className="jm-aviso">⚠️ Sessões curtas registram mínimo de 1h</p>
            )}

            {erro && <p className="error-msg">{erro}</p>}

            <div className="jm-acoes">
              <button className="btn-ghost" onClick={onFechar} disabled={estado === 'salvando'}>Descartar sessão</button>
              <button className="btn-green" onClick={salvar} disabled={estado === 'salvando'}>
                {estado === 'salvando' ? 'Salvando...' : `💾 Salvar +${horasAdicionar}h`}
              </button>
            </div>
          </div>
        )}

        {/* SALVO */}
        {estado === 'salvo' && (
          <div className="jm-content jm-salvo">
            <div className="jm-salvo-icon">✅</div>
            <h2 className="jm-titulo">Sessão salva!</h2>
            <p className="jm-salvo-msg">+{horasAdicionar}h adicionada{horasAdicionar !== 1 ? 's' : ''} à sua biblioteca</p>
          </div>
        )}
      </div>
    </div>
  )
}
