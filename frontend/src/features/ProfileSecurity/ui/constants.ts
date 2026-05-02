import { createTextField, type TextFieldConfig } from '@/shared/lib/forms'
import { FormFieldVariant } from '@/shared/lib/forms/types'

import type { ChangePasswordValues } from '../model/schema'

export const changePasswordDefaultValues: ChangePasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const labelClassName = 'text-h3 md:text-h3-d font-inter font-medium text-primary'

export const getChangePasswordFields = (): TextFieldConfig<ChangePasswordValues>[] => [
  createTextField<ChangePasswordValues>({
    name: 'currentPassword',
    type: 'password',
    label: 'Текущий пароль',
    labelClassName,
    placeholder: '',
    required: true,
    variant: FormFieldVariant.Filled,
    withoutClearButton: true,
  }),
  createTextField<ChangePasswordValues>({
    name: 'newPassword',
    type: 'password',
    label: 'Новый пароль',
    labelClassName,
    placeholder: '',
    required: true,
    variant: FormFieldVariant.Filled,
    withoutClearButton: true,
  }),
  createTextField<ChangePasswordValues>({
    name: 'confirmPassword',
    type: 'password',
    label: 'Подтвердите новый пароль',
    labelClassName,
    placeholder: '',
    required: true,
    variant: FormFieldVariant.Filled,
    withoutClearButton: true,
  }),
]
