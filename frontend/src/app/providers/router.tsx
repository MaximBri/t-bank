import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { EventPage } from '@/pages/event'
import { NotFoundPage } from '@/pages/not-found'
import { APP_ROUTES } from '@/shared/routes'
import { AppLayout } from '@/shared/ui/layout/AppLayout'

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={APP_ROUTES.HOME} element={<HomePage />} />
        <Route path={APP_ROUTES.EVENT} element={<EventPage />} />
        <Route path={APP_ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Route>
      <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />
    </Routes>
  </BrowserRouter>
)
