import { createFormSchema, type InferFormValues, requiredString } from '@/shared/lib/forms'

export const signInByCredentialsSchema = createFormSchema({
  login: requiredString('Введите логин'),
  password: requiredString('Введите пароль'),
})

export type SignInByCredentialsSchema = typeof signInByCredentialsSchema
export type SignInByCredentialsSchemaValues = InferFormValues<SignInByCredentialsSchema>
