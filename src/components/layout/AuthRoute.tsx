import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AuthRoute() {
  const location = useLocation()
  const { session, loading } = useAuth()

  if (loading) {
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

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
