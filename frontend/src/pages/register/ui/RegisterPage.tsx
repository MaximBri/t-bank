import { SignUpForm, type SignUpByCredentialsSubmit } from '@/features/sign-up-by-credentials'
import {LogoWithForm} from "@/shared/ui/LogoWithForm.tsx";

const submitSignUpForm: SignUpByCredentialsSubmit = async (payload) => {
  // Placeholder for future API integration.
  console.log('sign-up payload', payload)
  await Promise.resolve()
}

export const RegisterPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LogoWithForm>
        <SignUpForm onSubmit={submitSignUpForm} />
      </LogoWithForm>
    </main>
  )
}
