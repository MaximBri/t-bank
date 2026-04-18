import { createTextField, TextFieldConfig } from '@/shared/lib/forms'
import type { SignUpByCredentialsFormValues } from '../model/types.ts'

const signUpFieldLabelClassName = 'text-[16px] font-inter font-medium text-primary'
const signUpFieldInputClassName =
  'font-inter font-medium rounded-[16px] border px-[16px] py-[14px] text-[16px] border-[2px]'

export const getSignUpFormFields = (): TextFieldConfig<SignUpByCredentialsFormValues>[] => [
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
