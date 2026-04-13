import { createFormSchema, type InferFormValues, requiredString } from '@/shared/lib/forms'
import { signUpByCredentialsSchema } from "@/features/sign-up-by-credentials";

export const signInByCredentialsSchema = createFormSchema({
    login: requiredString('Введите логин'),
    password: requiredString('Введите пароль'),
})

export type SignInByCredentialsSchema = typeof signUpByCredentialsSchema
export type SignInByCredentialsSchemaValues = InferFormValues<SignInByCredentialsSchema>
