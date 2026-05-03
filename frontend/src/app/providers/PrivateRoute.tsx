import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useUserStore } from '@/entities/user'
import { APP_ROUTES } from '@/shared/routes'

export const PrivateRoute = () => {
  const location = useLocation()
  const isAuthResolved = useUserStore((state) => state.isAuthResolved)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  if (!isAuthResolved) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location }} />
  }

  return <Outlet />
}
