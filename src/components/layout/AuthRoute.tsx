import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AuthRoute() {
  const location = useLocation()
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-warmPaper flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-lavender-dark/30 border-t-lavender-dark rounded-full animate-spin mb-4" />
        <p className="font-serif text-deepPlum/60 animate-pulse">Checking your little world...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
