import { createFormSchema, requiredString } from '@/shared/lib/forms'
import { z } from 'zod'
import { parseNumberValue } from '@/shared/lib/number/parseNumber.ts'

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
    .array(z.number(), {
      required_error: 'Выберите хотя бы одного участника',
    })
    .min(1, 'Выберите хотя бы одного участника'),
  comment: z.string().optional(),
  checkImage: z
    .instanceof(File, { message: 'Поле обязательно' })
    .refine((file) => allowedMimeTypes.includes(file.type), 'Недопустимый формат файла')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Размер файла должен быть не больше 5 МБ'),
})
