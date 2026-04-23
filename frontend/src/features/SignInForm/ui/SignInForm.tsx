import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { APP_ROUTES } from '@/shared/routes'
import { TextField } from '@/shared/ui/form-fields'

import { getSignInFormFields } from '../lib/get-sign-in-form-fields.ts'
import { signInByCredentialsSchema } from '../model/schema.ts'
import type { SignInByCredentialsFormValues, SignInByCredentialsSubmit } from '../model/types.ts'
import { signInFormDefaultValues } from '@/features/SignInForm/ui/constants.ts'
import { Button } from '@/shared/ui/button/Button.tsx'
import { Text } from '@/shared/ui/text/Text.tsx'

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
        className="flex w-[310px] sm:w-[400px] flex-col gap-[10px] rounded-smd sm:rounded-lg bg-secondary p-[16px] sm:p-[25px]"
        onSubmit={submitForm}
      >
        <div className="flex flex-col sm:gap-[10px]">
          <Text variant="h3" as="h3">
            Вход
          </Text>
          <Text variant="small" className="text-muted font-medium">
            Войдите в свой аккаунт
          </Text>
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
              className="w-full h-[47px] rounded-md font-medium"
            >
              Войти
            </Button>
            <Text>
              Нет аккаунта?{' '}
              <Link to={APP_ROUTES.REGISTER} replace className="font-semibold underline">
                Зарегистрироваться
              </Link>
            </Text>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
