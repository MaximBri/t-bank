import { z } from 'zod'

import { createFormSchema, type InferFormValues, requiredString } from '@/shared/lib/forms'

export const signUpByCredentialsSchema = createFormSchema({
  login: requiredString('Введите логин').min(3, 'Логин должен содержать минимум 3 символа'),
  password: requiredString('Введите пароль').min(6, 'Пароль должен содержать минимум 6 символов'),
  passwordRepeat: requiredString('Пароли не совпадают'),
}).superRefine(({ password, passwordRepeat }, context) => {
  if (password !== passwordRepeat) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['passwordRepeat'],
      message: 'Пароли не совпадают',
    })
  }
})

export type SignUpByCredentialsSchema = typeof signUpByCredentialsSchema
export type SignUpByCredentialsSchemaValues = InferFormValues<SignUpByCredentialsSchema>
