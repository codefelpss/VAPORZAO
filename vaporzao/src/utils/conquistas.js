const KEY_GANHAS = 'vpz_conquistas'
const KEY_TOTAIS = 'vpz_totais'

function lerGanhas() {
  try { return JSON.parse(localStorage.getItem(KEY_GANHAS)) ?? {} } catch { return {} }
}
function lerTotais() {
  try { return JSON.parse(localStorage.getItem(KEY_TOTAIS)) ?? {} } catch { return {} }
}

export function getDesbloqueadas(jogoId) {
  const data = lerGanhas()
  return new Set(data[String(jogoId)] ?? [])
}

export function desbloquear(jogoId, conquistaId) {
  const data = lerGanhas()
  const key = String(jogoId)
  const set = new Set(data[key] ?? [])
  if (set.has(conquistaId)) return false
  set.add(conquistaId)
  data[key] = [...set]
  localStorage.setItem(KEY_GANHAS, JSON.stringify(data))
  return true
}

// Guarda o total de conquistas do jogo (cache para não precisar de API)
export function cachearTotal(jogoId, total) {
  const data = lerTotais()
  data[String(jogoId)] = total
  localStorage.setItem(KEY_TOTAIS, JSON.stringify(data))
}

export function getTotal(jogoId) {
  return lerTotais()[String(jogoId)] ?? null
}

// Retorna { desbloqueadas, total, pct } ou null se não tiver cache do total
export function getProgresso(jogoId) {
  const total = getTotal(jogoId)
  if (total === null) return null
  const desbloqueadas = getDesbloqueadas(jogoId).size
  const pct = total === 0 ? 100 : Math.round((desbloqueadas / total) * 100)
  return { desbloqueadas, total, pct }
}

// Sorteia conquistas para desbloquear com base no tempo de sessão
export function sortearParaDesbloquear(conquistas, segundosSessao, jogoId) {
  const naoGanhas = conquistas.filter(c => !getDesbloqueadas(jogoId).has(c.id))
  if (naoGanhas.length === 0) return []

  const seg = segundosSessao
  let max = 0
  if (seg >= 2)  max = 1
  if (seg >= 10) max = 2
  if (seg >= 20) max = 3

  if (max === 0) return []

  const qtd = Math.floor(Math.random() * (max + 1))
  if (qtd === 0) return []

  return [...naoGanhas]
    .sort(() => Math.random() - 0.5)
    .slice(0, qtd)
}
