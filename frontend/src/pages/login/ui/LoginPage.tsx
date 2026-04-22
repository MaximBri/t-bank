import { LogoWithForm } from '@/shared/ui/LogoWithForm.tsx'
import { SignInByCredentialsSubmit, SignInForm } from '@/features/SignInForm'

const submitSignInForm: SignInByCredentialsSubmit = async (payload) => {
  // Placeholder for future API integration.
  console.log('sign-in payload', payload)
  await Promise.resolve()
}

export const LoginPage = () => {
  return (
    <main className="py-[20px] flex min-h-screen items-center justify-center">
      <LogoWithForm>
        <SignInForm onSubmit={submitSignInForm} />
      </LogoWithForm>
    </main>
  )
}
