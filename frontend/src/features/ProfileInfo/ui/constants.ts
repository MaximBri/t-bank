import { createTextField, type TextFieldConfig } from '@/shared/lib/forms'
import { FormFieldVariant } from '@/shared/lib/forms/types'

import type { ProfileSchemaValues } from '../model/schema'

export const profileFormDefaultValues: ProfileSchemaValues = {
  firstName: 'Иван',
  lastName: 'Иванов',
  email: 'ivanov@example.com',
}

export const getProfileFormFields = (): TextFieldConfig<ProfileSchemaValues>[] => [
  createTextField<ProfileSchemaValues>({
    name: 'firstName',
    type: 'text',
    label: '',
    labelClassName: 'hidden',
    placeholder: 'Имя',
    required: true,
    variant: FormFieldVariant.Filled,
    withoutClearButton: true,
  }),
  createTextField<ProfileSchemaValues>({
    name: 'lastName',
    type: 'text',
    label: '',
    labelClassName: 'hidden',
    placeholder: 'Фамилия',
    required: true,
    variant: FormFieldVariant.Filled,
    withoutClearButton: true,
  }),
  createTextField<ProfileSchemaValues>({
    name: 'email',
    type: 'email',
    label: '',
    labelClassName: 'hidden',
    placeholder: 'Email',
    required: true,
    variant: FormFieldVariant.Filled,
    withoutClearButton: true,
  }),
]
