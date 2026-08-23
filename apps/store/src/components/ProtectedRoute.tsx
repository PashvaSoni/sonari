import type { ReactElement, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSession } from '../hooks/useAuthSession.js'

type ProtectedRouteProps = {
  children: ReactNode
  /** When true (default), user must have completed tenant bootstrap. */
  requireBootstrap?: boolean
}

export function ProtectedRoute({
  children,
  requireBootstrap = true,
}: ProtectedRouteProps): ReactElement {
  const { user, loading, bootstrapped } = useAuthSession()
  const location = useLocation()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requireBootstrap && !bootstrapped) {
    return <Navigate to="/signup" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
