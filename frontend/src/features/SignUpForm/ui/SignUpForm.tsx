import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { APP_ROUTES } from '@/shared/routes'
import { TextField } from '@/shared/ui/form-fields'

import { signUpByCredentialsSchema } from '../model/schema.ts'

import type { SignUpByCredentialsFormValues, SignUpByCredentialsSubmit } from '../model/types.ts'

import { getSignUpFormFields } from '../lib/getSignUpFormFields.ts'
import { signUpFormDefaultValues } from '@/features/SignUpForm/ui/constants.ts'
import { Button } from '@/shared/ui/button/Button.tsx'
import { Text } from '@/shared/ui/text/Text.tsx'

type SignUpFormProps = {
  onSubmit: SignUpByCredentialsSubmit
}

export const SignUpForm = ({ onSubmit }: SignUpFormProps) => {
  const signUpFields = getSignUpFormFields()

  const methods = useForm<SignUpByCredentialsFormValues>({
    resolver: zodResolver(signUpByCredentialsSchema),
    mode: 'onTouched',
    defaultValues: signUpFormDefaultValues,
  })

  const {
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = methods

  const submitForm = handleSubmit(async ({ login, password }) => {
    await onSubmit({ login, password })
    reset({ ...signUpFormDefaultValues })
  })

  return (
    <FormProvider {...methods}>
      <form
        className="flex w-[310px] sm:w-[400px] flex-col gap-[12px] rounded-smd sm:rounded-lg bg-secondary p-[16px] sm:p-[25px]"
        onSubmit={submitForm}
      >
        <div>
          <Text variant="h3" as="h3">
            Регистрация
          </Text>
          <Text variant="small" className="text-muted font-medium">
            Создайте свой аккаунт
          </Text>
        </div>

        <div className="flex flex-col gap-[16px] sm:gap-[27px]">
          {signUpFields.map((field) => (
            <TextField key={field.name} {...field} />
          ))}
          <div className="flex flex-col items-center justify-center gap-[14px] sm:gap-[21px]">
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="w-full min-h-[47px] rounded-md font-medium"
            >
              Зарегистрироваться
            </Button>
            <Text className="text-small sm:text-body text-center">
              Есть аккаунт?{' '}
              <Link to={APP_ROUTES.LOGIN} replace className="font-semibold underline">
                Войти
              </Link>
            </Text>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
