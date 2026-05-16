import z from 'zod'

export const profileSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().email('Введите корректный email'),
})

export type ProfileSchema = typeof profileSchema
export type ProfileSchemaValues = z.input<ProfileSchema>
