import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSessionExpiry = async (currentSession: Session | null) => {
      if (!currentSession?.user?.last_sign_in_at) return currentSession
      const signInDate = new Date(currentSession.user.last_sign_in_at).getTime()
      const now = Date.now()
      const MAX_AGE_MS = 72 * 60 * 60 * 1000 // 72 hours
      if (now - signInDate > MAX_AGE_MS) {
        await supabase.auth.signOut()
        return null
      }
      return currentSession
    }

    // Get initial session
    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        if (error) {
          setSession(null)
          setUser(null)
          return
        }
        const validSession = await checkSessionExpiry(session)
        setSession(validSession)
        setUser(validSession?.user ?? null)
      })
      .catch(() => {
        setSession(null)
        setUser(null)
      })
      .finally(() => setLoading(false))

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const validSession = await checkSessionExpiry(session)
      setSession(validSession)
      setUser(validSession?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
