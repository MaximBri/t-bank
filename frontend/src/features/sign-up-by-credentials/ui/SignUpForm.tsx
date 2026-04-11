import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { createTextField, type TextFieldConfig } from '@/shared/lib/forms'
import { APP_ROUTES } from '@/shared/routes'
import { TextField } from '@/shared/ui/form-fields'

import { signUpByCredentialsSchema } from '../model/schema.ts'
import type {
  SignUpByCredentialsFormValues,
  SignUpByCredentialsPayload,
  SignUpByCredentialsSubmit,
} from '../model/types.ts'

const signUpFieldLabelClassName = 'text-[16px] font-inter font-medium text-primary'
const signUpFieldInputClassName =
  'font-inter font-medium rounded-[16px] bg-primary border border-primary px-[16px] py-[14px] text-[16px] border-[2px]'

const signUpFields: TextFieldConfig<SignUpByCredentialsFormValues>[] = [
  createTextField<SignUpByCredentialsFormValues>({
    name: 'login',
    type: 'text',
    label: 'Логин',
    labelClassName: signUpFieldLabelClassName,
    fieldClassName: signUpFieldInputClassName,
    placeholder: 'Ваш логин',
    required: true,
  }),
  createTextField<SignUpByCredentialsFormValues>({
    name: 'password',
    type: 'password',
    label: 'Пароль',
    labelClassName: signUpFieldLabelClassName,
    fieldClassName: signUpFieldInputClassName,
    placeholder: 'Ваш пароль',
    required: true,
  }),
  createTextField<SignUpByCredentialsFormValues>({
    name: 'passwordRepeat',
    type: 'password',
    label: 'Повторите пароль',
    labelClassName: signUpFieldLabelClassName,
    fieldClassName: signUpFieldInputClassName,
    placeholder: 'Повторите пароль',
    required: true,
  }),
]

const defaultSubmit: SignUpByCredentialsSubmit = async (_payload: SignUpByCredentialsPayload) => {
  await Promise.resolve()
}

type SignUpFormProps = {
  onSubmit?: SignUpByCredentialsSubmit
}

export const SignUpForm = ({ onSubmit = defaultSubmit }: SignUpFormProps) => {
  const methods = useForm<SignUpByCredentialsFormValues>({
    resolver: zodResolver(signUpByCredentialsSchema),
    mode: 'onTouched',
    defaultValues: {
      login: '',
      password: '',
      passwordRepeat: '',
    },
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
      reset({
        login: '',
        password: '',
        passwordRepeat: '',
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить форму')
    }
  })

  return (
    <FormProvider {...methods}>
      <form
        className="flex w-[391px] flex-col gap-[24px] rounded-[24px] bg-secondary p-[25px]"
        onSubmit={submitForm}
      >
        <div className="gap-[10px]">
          <h1 className="font-inter text-[20px] font-medium text-primary">Регистрация</h1>
          <p className="font-inter text-[16px] font-medium text-[#666666]">
            Создайте свой аккаунт
          </p>
        </div>

        <div className="flex flex-col gap-[27px]">
          {signUpFields.map((field) => (
            <TextField key={field.name} {...field} />
          ))}
        </div>

        {submitError ? (
          <p className=" text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-col items-center justify-center gap-[21px]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-[16px] border-[2px] border-yellow bg-yellow py-[10px] font-inter font-medium text-primary disabled:bg-yellow-disabled"
          >
            {isSubmitting ? 'Отправка...' : 'Зарегистрироваться'}
          </button>
          <p className="font-inter">
            Есть аккаунт?{' '}
            <Link to={APP_ROUTES.LOGIN} replace className="font-semibold underline">
              Войти
            </Link>
          </p>
        </div>
      </form>
    </FormProvider>
  )
}
