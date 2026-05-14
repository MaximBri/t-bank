import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useUserStore } from '@/entities/user'
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
      await register({ ...payload, inviteToken })
      pendingInvite.clear()
      toast.success(inviteToken ? 'Аккаунт создан, заявка отправлена организатору' : 'Аккаунт создан')
      navigate(APP_ROUTES.HOME)
    } catch (error) {
      toast.error('Не удалось зарегистрироваться')
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
