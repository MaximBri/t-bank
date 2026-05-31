import z from 'zod'
import { MAX_UPLOAD_FILE_SIZE_BYTES, maxUploadFileSizeErrorMessage } from '@/shared/config/upload'

export const profileSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_UPLOAD_FILE_SIZE_BYTES, maxUploadFileSizeErrorMessage)
    .optional(),
})

export type ProfileSchema = typeof profileSchema
export type ProfileSchemaValues = z.input<ProfileSchema>
