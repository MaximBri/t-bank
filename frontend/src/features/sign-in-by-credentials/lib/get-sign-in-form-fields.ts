import { createTextField, type TextFieldConfig } from '@/shared/lib/forms'

import type { SignInByCredentialsFormValues } from '../model/types.ts'

const signInFieldLabelClassName = 'text-[16px] font-inter font-medium text-primary'
const signInFieldInputClassName =
  'font-inter font-medium rounded-[16px] border px-[16px] py-[14px] text-[16px] border-[2px]'

export const getSignInFormFields = (): TextFieldConfig<SignInByCredentialsFormValues>[] => [
  createTextField<SignInByCredentialsFormValues>({
    name: 'login',
    type: 'text',
    label: 'Логин',
    labelClassName: signInFieldLabelClassName,
    fieldClassName: signInFieldInputClassName,
    placeholder: 'Ваш логин',
    required: true,
  }),
  createTextField<SignInByCredentialsFormValues>({
    name: 'password',
    type: 'password',
    label: 'Пароль',
    labelClassName: signInFieldLabelClassName,
    fieldClassName: signInFieldInputClassName,
    placeholder: 'Ваш пароль',
    required: true,
  }),
]
