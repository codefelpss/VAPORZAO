export function initSmokeEffect() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button')
    if (!btn || btn.disabled || btn.dataset.noSmoke) return

    const x = e.clientX
    const y = e.clientY

    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div')
      p.className = 'smoke-particle'

      const size     = Math.random() * 22 + 8
      const dx       = (Math.random() - 0.5) * 60
      const dy       = -(Math.random() * 40 + 20)
      const duration = Math.random() * 350 + 450
      const delay    = Math.random() * 120

      p.style.cssText = `
        left:${x}px;
        top:${y}px;
        width:${size}px;
        height:${size}px;
        filter:blur(${Math.random() * 3 + 2}px);
        animation-duration:${duration}ms;
        animation-delay:${delay}ms;
      `
      p.style.setProperty('--sx', `calc(-50% + ${dx}px)`)
      p.style.setProperty('--sy', `calc(-50% + ${dy}px)`)

      document.body.appendChild(p)
      setTimeout(() => p.remove(), duration + delay + 50)
    }
  })
}
