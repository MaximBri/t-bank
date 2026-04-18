import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { APP_ROUTES } from '@/shared/routes'
import { TextField } from '@/shared/ui/form-fields'

import { getSignInFormFields } from '../lib/get-sign-in-form-fields.ts'
import { signInByCredentialsSchema } from '../model/schema.ts'
import type { SignInByCredentialsFormValues, SignInByCredentialsSubmit } from '../model/types.ts'
import { signInFormDefaultValues } from '@/features/sign-in-by-credentials/ui/sign-in-form.constants.ts'
import { Button } from '@/shared/ui/button/Button.tsx'

type SignInFormProps = {
  onSubmit: SignInByCredentialsSubmit
}

export const SignInForm = ({ onSubmit }: SignInFormProps) => {
  const signInFields = getSignInFormFields()

  const methods = useForm<SignInByCredentialsFormValues>({
    resolver: zodResolver(signInByCredentialsSchema),
    mode: 'onTouched',
    defaultValues: signInFormDefaultValues,
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = methods

  const submitForm = handleSubmit(async ({ login, password }) => {
    setSubmitError(null)

    try {
      await onSubmit({ login, password })
      reset(signInFormDefaultValues)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить форму')
    }
  })

  return (
      <FormProvider {...methods}>
        <form
            className="flex w-[310px] sm:w-[400px] flex-col gap-[10px] rounded-[12px] sm:rounded-[24px] bg-secondary p-[16px] sm:p-[25px]"
            onSubmit={submitForm}
        >
          <div className="flex flex-col sm:gap-[10px]">
            <p className="font-inter text-[20px] font-medium text-primary">Вход</p>
            <p className="font-inter text-[14px] font-medium text-muted">Войдите в свой аккаунт</p>
          </div>

          <div className="flex flex-col gap-[16px] sm:gap-[27px]">
            {signInFields.map((field) => (
                <TextField key={field.name} {...field} />
            ))}
            {submitError ? <p className="text-sm text-error">{submitError}</p> : null}

            <div className="flex flex-col items-center justify-center gap-[14px] sm:gap-[27px]">
              <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="w-full rounded-[16px] border-[2px] border-yellow bg-yellow py-[10px] font-inter font-medium text-primary disabled:bg-yellow-disabled"
              >
                Войти
              </Button>
              <p className="text-[14px] sm:text-[16px] font-inter">
                Нет аккаунта?{' '}
                <Link to={APP_ROUTES.REGISTER} replace className="font-semibold underline">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </div>
        </form>
      </FormProvider>
  )
}
