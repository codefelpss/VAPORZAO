import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import { initSmokeEffect } from './utils/smokeEffect'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Jogos from './pages/Jogos'
import Jogo from './pages/Jogo'
import Conquista from './pages/Conquista'
import AreaGamer from './pages/AreaGamer'
import Perfil from './pages/Perfil'
import Estudio from './pages/Estudio'
import CriarJogo from './pages/CriarJogo'

export default function App() {
  useEffect(() => initSmokeEffect(), [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/jogos" element={<Jogos />} />
            <Route path="/jogos/:id" element={<Jogo />} />
            <Route path="/conquistas/:id" element={<Conquista />} />
            <Route path="/perfil/:matricula" element={<Perfil />} />
            <Route path="/area-gamer" element={<ProtectedRoute><AreaGamer /></ProtectedRoute>} />
            <Route path="/estudio" element={<ProtectedRoute><Estudio /></ProtectedRoute>} />
            <Route path="/estudio/novo" element={<ProtectedRoute><CriarJogo /></ProtectedRoute>} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}
