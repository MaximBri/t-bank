import { createTextField, TextFieldConfig } from '@/shared/lib/forms'
import type { SignUpByCredentialsFormValues } from '../model/types.ts'

export const getSignUpFormFields = (): TextFieldConfig<SignUpByCredentialsFormValues>[] => [
  createTextField<SignUpByCredentialsFormValues>({
    name: 'login',
    type: 'text',
    label: 'Логин',
    placeholder: 'Ваш логин',
    required: true,
  }),
  createTextField<SignUpByCredentialsFormValues>({
    name: 'password',
    type: 'password',
    label: 'Пароль',
    placeholder: 'Ваш пароль',
    withoutClearButton: true,
    required: true,
  }),
  createTextField<SignUpByCredentialsFormValues>({
    name: 'passwordRepeat',
    type: 'password',
    label: 'Повторите пароль',
    placeholder: 'Повторите пароль',
    withoutClearButton: true,
    required: true,
  }),
]
