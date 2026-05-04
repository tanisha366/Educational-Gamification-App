import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Navbar from './components/layout/Navbar'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import QuizListPage from './pages/QuizListPage'
import QuizPage from './pages/QuizPage'
import NotFoundPage from './pages/NotFoundPage'
import Playground from './pages/Playground'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const BadgesPage = lazy(() => import('./pages/BadgesPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))

function RouteLoader() {
  return (
    <div className="page-loader" aria-live="polite" aria-busy="true">
      <div className="spinner" aria-hidden="true" />
      <div style={{ color: 'var(--text-muted)', marginTop: 12 }}>Loading…</div>
    </div>
  )
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/badges" element={<PageTransition><BadgesPage /></PageTransition>} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><DashboardPage /></PageTransition></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><PageTransition><QuizListPage /></PageTransition></ProtectedRoute>} />
        <Route path="/quiz/:id" element={<ProtectedRoute><PageTransition><QuizPage /></PageTransition></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><PageTransition><LeaderboardPage /></PageTransition></ProtectedRoute>} />
        <Route path="/playground" element={<ProtectedRoute><PageTransition><Playground /></PageTransition></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Suspense fallback={<RouteLoader />}>
            <AnimatedRoutes />
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}