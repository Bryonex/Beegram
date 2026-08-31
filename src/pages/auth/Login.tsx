import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import heroImg from '../../assets/hero.png'

const loginHero = '/heart%20loginpage.jpeg'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { session, loading: sessionLoading } = useAuth()

  useEffect(() => {
    if (session) {
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
      navigate(from && from !== '/login' ? from : '/home', { replace: true })
    }
  }, [session, location.state, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('login-with-username', {
        body: {
          username: username.toLowerCase().trim(),
          password
        }
      })

      if (functionError || data?.error) {
        throw new Error("That username or password doesn't look right.")
      }

      // The edge function returns the session directly
      if (data?.session) {
        const { error: sessionError } = await supabase.auth.setSession(data.session)
        if (sessionError) throw new Error("Session error")
      } else {
        throw new Error("Invalid response")
      }

      const redirectPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
      navigate(redirectPath && redirectPath !== '/login' ? redirectPath : '/home', { replace: true })
    } catch (err: any) {
      // Always show generic error to avoid user enumeration
      setError("That username or password doesn't look right.")
    } finally {
      setLoading(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#FFF9F3] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Soft background glows */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#DED6E8]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-[#FFE4E1]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col items-center z-10 animate-pulse">
          <div className="text-4xl mb-4 animate-bounce">🐝</div>
          <p className="font-serif text-[#4A3219]/60 tracking-wider">Loading our world...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warmPaper flex flex-col items-center justify-center p-6 relative overflow-hidden pt-safe pb-safe">
      {/* Soft background glow */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-lavender-soft/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blush/20 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-32 h-32 mx-auto mb-6 rounded-full bg-white shadow-xl p-2 relative"
          >
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <img 
                src={loginHero}
                alt="Beegram Mascot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = heroImg
                }}
              />
              <div className="absolute inset-0 bg-lavender-deep/10 mix-blend-overlay" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-serif text-deepPlum mb-2">Beegram</h1>
          <p className="text-deepPlum/60 text-sm font-sans italic">Enter our private space</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              required
              className="w-full px-5 py-3.5 bg-white/70 border border-lavender-mist/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lavender-soft/50 focus:bg-white text-deepPlum placeholder-deepPlum/40 transition-all shadow-sm backdrop-blur-sm"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              className="w-full pl-5 pr-12 py-3.5 bg-white/70 border border-lavender-mist/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lavender-soft/50 focus:bg-white text-deepPlum placeholder-deepPlum/40 transition-all shadow-sm backdrop-blur-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-deepPlum/40 hover:text-deepPlum/60 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-lavender-dark text-white rounded-2xl font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
