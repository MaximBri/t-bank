import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useUserStore } from '@/entities/user'
import { eventsApi } from '@/entities/event'
import { SignUpForm, type SignUpByCredentialsSubmit } from '@/features/SignUpForm'
import { APP_ROUTES } from '@/shared/routes'
import { LogoWithForm } from '@/shared/ui/LogoWithForm.tsx'
import { pendingInvite } from '@/shared/lib/pendingInvite'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const register = useUserStore((state) => state.register)

  const submitSignUpForm: SignUpByCredentialsSubmit = async (payload) => {
    try {
      const inviteToken = pendingInvite.get()
      await register(payload)
      pendingInvite.clear()

      if (inviteToken) {
        try {
          await eventsApi.applyByToken(inviteToken)
          toast.success('Аккаунт создан, заявка отправлена организатору')
        } catch {
          toast.success('Аккаунт создан')
        }
      } else {
        toast.success('Аккаунт создан')
      }

      navigate(APP_ROUTES.HOME)
    } catch (error) {
      const status = (error as { status?: number })?.status
      toast.error(status === 409 ? 'Пользователь с таким логином уже существует' : 'Не удалось зарегистрироваться')
      throw error
    }
  }

  return (
    <main className="py-[20px] flex min-h-screen items-center justify-center">
      <LogoWithForm>
        <SignUpForm onSubmit={submitSignUpForm} />
      </LogoWithForm>
    </main>
  )
}
