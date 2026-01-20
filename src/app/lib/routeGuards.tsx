import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageRoutes } from 'app/lib/routes'
import { useAuth } from 'app/lib/AuthProvider'

export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'unknown') return null

  if (status === 'guest') {
    return (
      <Navigate
        to={PageRoutes.login}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}

export function PublicOnly() {
  const { status } = useAuth()

  if (status === 'unknown') return null

  if (status === 'authed') {
    return <Navigate to={PageRoutes.home} replace />
  }

  return <Outlet />
}
