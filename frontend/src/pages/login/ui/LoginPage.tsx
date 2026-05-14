import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useUserStore } from '@/entities/user'
import { LogoWithForm } from '@/shared/ui/LogoWithForm.tsx'
import { SignInByCredentialsSubmit, SignInForm } from '@/features/SignInForm'
import { APP_ROUTES } from '@/shared/routes'
import { pendingInvite } from '@/shared/lib/pendingInvite'

export const LoginPage = () => {
  const navigate = useNavigate()
  const login = useUserStore((state) => state.login)

  const submitSignInForm: SignInByCredentialsSubmit = async (payload) => {
    try {
      const inviteToken = pendingInvite.get()
      await login({ ...payload, inviteToken })
      pendingInvite.clear()
      toast.success(inviteToken ? 'Заявка отправлена организатору' : 'Вход выполнен')
      navigate(APP_ROUTES.HOME)
    } catch (error) {
      const status = (error as { status?: number })?.status
      toast.error(status === 401 ? 'Неверные логин или пароль' : 'Не удалось войти')
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
