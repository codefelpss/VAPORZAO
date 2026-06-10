const BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function req(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.token = token

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const msg = data?.erro || 'Erro na requisição'
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

const api = {
  // Auth
  login: (body) => req('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  primeiroAcesso: (body) => req('/auth/primeiro-acesso', { method: 'POST', body: JSON.stringify(body) }),
  me: () => req('/auth/me'),

  // Jogos
  destaques: () => req('/jogos/destaques'),
  listarJogos: (params) => req('/jogos?' + new URLSearchParams(params)),
  getJogo: (id) => req(`/jogos/${id}`),
  statusJogo: (id) => req(`/jogos/${id}/status`),
  criarJogo: (body) => req('/jogos', { method: 'POST', body: JSON.stringify(body) }),
  editarJogo: (id, body) => req(`/jogos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deletarJogo: (id) => req(`/jogos/${id}`, { method: 'DELETE' }),

  // Conquistas
  getConquista: (id) => req(`/conquistas/${id}`),
  criarConquista: (jogoId, body) => req(`/jogos/${jogoId}/conquistas`, { method: 'POST', body: JSON.stringify(body) }),
  deletarConquista: (id) => req(`/conquistas/${id}`, { method: 'DELETE' }),

  // Imagens
  criarImagem: (jogoId, body) => req(`/jogos/${jogoId}/imagens`, { method: 'POST', body: JSON.stringify(body) }),
  deletarImagem: (id) => req(`/imagens/${id}`, { method: 'DELETE' }),

  // Vídeos
  criarVideo: (jogoId, body) => req(`/jogos/${jogoId}/videos`, { method: 'POST', body: JSON.stringify(body) }),
  deletarVideo: (id) => req(`/videos/${id}`, { method: 'DELETE' }),

  // Reviews
  getReviews: (jogoId) => req(`/jogos/${jogoId}/reviews`),
  criarReview: (jogoId, body) => req(`/jogos/${jogoId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
  editarReview: (id, body) => req(`/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deletarReview: (id) => req(`/reviews/${id}`, { method: 'DELETE' }),

  // Biblioteca
  getBiblioteca: () => req('/biblioteca/me'),
  adicionarBiblioteca: (jogoId) => req(`/biblioteca/${jogoId}`, { method: 'POST' }),
  removerBiblioteca: (jogoId) => req(`/biblioteca/${jogoId}`, { method: 'DELETE' }),
  atualizarHoras: (jogoId, horasJogadas) => req(`/biblioteca/${jogoId}`, { method: 'PATCH', body: JSON.stringify({ horasJogadas }) }),

  // Wishlist
  getWishlist: () => req('/wishlist/me'),
  adicionarWishlist: (jogoId) => req(`/wishlist/${jogoId}`, { method: 'POST' }),
  removerWishlist: (jogoId) => req(`/wishlist/${jogoId}`, { method: 'DELETE' }),

  // Gêneros
  getGeneros: () => req('/generos'),

  // Usuários
  getPerfil: (matricula) => req(`/usuarios/${matricula}`),
  updateMe: (body) => req('/usuarios/me', { method: 'PATCH', body: JSON.stringify(body) }),
}

export default api
