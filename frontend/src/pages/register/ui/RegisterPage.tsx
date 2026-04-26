import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useUserStore } from '@/entities/user'
import { SignUpForm, type SignUpByCredentialsSubmit } from '@/features/SignUpForm'
import { APP_ROUTES } from '@/shared/routes'
import { LogoWithForm } from '@/shared/ui/LogoWithForm.tsx'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const register = useUserStore((state) => state.register)

  const submitSignUpForm: SignUpByCredentialsSubmit = async (payload) => {
    try {
      await register(payload)
      toast.success('Аккаунт создан')
      navigate(APP_ROUTES.HOME)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось зарегистрироваться')
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
