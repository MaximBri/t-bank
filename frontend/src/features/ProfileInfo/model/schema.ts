import z from 'zod'

export const profileSchema = z.object({
  firstName: z.string().min(1, 'Введите имя'),
  lastName: z.string().min(1, 'Введите фамилию'),
  email: z.string().email('Введите корректный email'),
})

export type ProfileSchema = typeof profileSchema
export type ProfileSchemaValues = z.infer<ProfileSchema>
