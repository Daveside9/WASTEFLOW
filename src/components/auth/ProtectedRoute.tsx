import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Waves } from 'lucide-react'

interface Props {
  children: React.ReactNode
  requiredRole?: string[]
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // Still restoring session — show minimal full-page loader
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#071C2C' }}
        aria-label="Loading"
      >
        <div className="w-12 h-12 rounded-xl bg-teal flex items-center justify-center
                        shadow-[0_4px_20px_rgba(15,166,142,0.4)] animate-pulse">
          <Waves size={22} className="text-white" />
        </div>
        <p className="text-white/40 text-sm">Loading…</p>
      </div>
    )
  }

  // Not logged in → redirect to sign in, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  // Admin always goes to /admin
  if (user?.role === 'admin' && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />
  }

  // Role check (optional)
  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
