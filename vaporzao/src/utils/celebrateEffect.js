const CONFETTI_COLORS = ['#ffd700', '#ffb300', '#ff6b6b', '#4ecdc4', '#45b7d1', '#dda0dd', '#98fb98', '#fff']

export function triggerCelebration(x, y) {
  // Fumaça amarela
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div')
    p.className = 'smoke-particle'
    const size = Math.random() * 30 + 10
    const dx = (Math.random() - 0.5) * 90
    const dy = -(Math.random() * 55 + 20)
    const duration = Math.random() * 450 + 500
    const delay = Math.random() * 150
    p.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;filter:blur(${Math.random()*4+2}px);animation-duration:${duration}ms;animation-delay:${delay}ms;background:radial-gradient(circle,rgba(255,215,0,.75) 0%,rgba(255,160,0,.3) 55%,transparent 100%);`
    p.style.setProperty('--sx', `calc(-50% + ${dx}px)`)
    p.style.setProperty('--sy', `calc(-50% + ${dy}px)`)
    document.body.appendChild(p)
    setTimeout(() => p.remove(), duration + delay + 50)
  }

  // Confetes
  for (let i = 0; i < 38; i++) {
    const c = document.createElement('div')
    c.className = 'confetti-piece'
    const w = Math.random() * 9 + 4
    const h = Math.random() * 5 + 3
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    const dx = (Math.random() - 0.5) * 240
    const dy = -(Math.random() * 120 + 40) // sobe, depois cai pela opacidade
    const rot = (Math.random() - 0.5) * 900
    const duration = Math.random() * 700 + 700
    const delay = Math.random() * 350
    c.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${color};border-radius:2px;animation-duration:${duration}ms;animation-delay:${delay}ms;`
    c.style.setProperty('--cx', `calc(-50% + ${dx}px)`)
    c.style.setProperty('--cy', `calc(-50% + ${dy}px)`)
    c.style.setProperty('--cr', `${rot}deg`)
    document.body.appendChild(c)
    setTimeout(() => c.remove(), duration + delay + 50)
  }
}
