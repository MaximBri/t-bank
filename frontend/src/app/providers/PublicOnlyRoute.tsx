import { Navigate, Outlet } from 'react-router-dom'

import { useUserStore } from '@/entities/user'
import { APP_ROUTES } from '@/shared/routes'

export const PublicOnlyRoute = () => {
  const isAuthResolved = useUserStore((state) => state.isAuthResolved)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  if (!isAuthResolved) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to={APP_ROUTES.HOME} replace />
  }

  return <Outlet />
}
