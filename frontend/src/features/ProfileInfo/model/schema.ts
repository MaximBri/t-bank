import z from 'zod'

export const profileSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  avatar: z.instanceof(File).optional(),
})

export type ProfileSchema = typeof profileSchema
export type ProfileSchemaValues = z.input<ProfileSchema>
