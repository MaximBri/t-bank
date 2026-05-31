import { createFormSchema, requiredString } from '@/shared/lib/forms'
import { z } from 'zod'
import { parseNumberValue } from '@/shared/lib/number/parseNumber.ts'
import { MAX_UPLOAD_FILE_SIZE_BYTES, maxUploadFileSizeErrorMessage } from '@/shared/config/upload'

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

export const createExpenseSchema = createFormSchema({
  title: requiredString(),
  amount: z.preprocess(
    (value) => {
      const parsedValue = parseNumberValue(value)
      return parsedValue ?? value
    },
    z
      .number({
        invalid_type_error: 'Введите корректную сумму',
        required_error: 'Введите корректную сумму',
      })
      .positive('Сумма должна быть положительной'),
  ),
  category: requiredString('Выберите категорию для расхода'),
  participants: z
    .array(z.string(), {
      required_error: 'Выберите хотя бы одного участника',
    })
    .min(2, "Для создания расхода необходимо выбрать хотя бы 2 участника"),
  comment: z.string().optional(),
  checkImage: z
    .instanceof(File, { message: 'Поле обязательно' })
    .refine((file) => allowedMimeTypes.includes(file.type), 'Недопустимый формат файла')
    .refine((file) => file.size <= MAX_UPLOAD_FILE_SIZE_BYTES, maxUploadFileSizeErrorMessage)
    .optional(),
})
