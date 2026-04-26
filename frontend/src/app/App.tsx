import { Toaster } from 'sonner'

import { AuthBootstrap } from './providers/AuthBootstrap'
import { AppRouter } from './providers/router'

export function App() {
  return (
    <>
      <AuthBootstrap />
      <Toaster position="top-center" richColors closeButton={false} />
      <AppRouter />
    </>
  )
}
