import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useUserStore } from '@/entities/user'
import { LogoWithForm } from '@/shared/ui/LogoWithForm.tsx'
import { SignInByCredentialsSubmit, SignInForm } from '@/features/SignInForm'
import { APP_ROUTES } from '@/shared/routes'

export const LoginPage = () => {
  const navigate = useNavigate()
  const login = useUserStore((state) => state.login)

  const submitSignInForm: SignInByCredentialsSubmit = async (payload) => {
    try {
      await login(payload)
      toast.success('Вход выполнен')
      navigate(APP_ROUTES.HOME)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось войти')
      throw error
    }
  }

  return (
    <main className="py-[20px] flex min-h-screen items-center justify-center">
      <LogoWithForm>
        <SignInForm onSubmit={submitSignInForm} />
      </LogoWithForm>
    </main>
  )
}
