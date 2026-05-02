import { z } from 'zod'

import { requiredString } from '@/shared/lib/forms'
import { reviseCommentMaxLength } from './constants.ts'
import { parseNumberValue } from '@/shared/lib/number/parseNumber.ts'

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

export const reviseExpenseSchema = z.object({
  comment: requiredString().max(reviseCommentMaxLength, {
    message: `Максимум ${reviseCommentMaxLength} символов`,
  }),
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
  category: requiredString(),
  checkImage: z
    .instanceof(File)
    .refine((file) => allowedMimeTypes.includes(file.type), 'Недопустимый формат файла')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Размер файла должен быть не больше 5 МБ'),
})
