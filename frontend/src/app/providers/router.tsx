import { createBrowserRouter } from 'react-router-dom'

import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { EventPage } from '@/pages/event'
import { NotFoundPage } from '@/pages/not-found'
import { APP_ROUTES } from '@/shared/routes'

export const appRouter = createBrowserRouter([
  {
    path: APP_ROUTES.HOME,
    element: <HomePage />,
  },
  {
    path: APP_ROUTES.EVENT,
    element: <EventPage />,
  },
  {
    path: APP_ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: APP_ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: APP_ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },
])
