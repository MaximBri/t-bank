import { APP_ROUTES } from '@/shared/routes'
import { Navigate } from 'react-router-dom'

export const NotFoundPage = () => {
  return <Navigate to={APP_ROUTES.HOME} replace={true} />
}
