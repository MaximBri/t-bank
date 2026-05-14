import { z } from 'zod'

import { expenseCategoriesAddSchema } from '@/entities/expense'
import { createFormSchema, requiredString } from '@/shared/lib/forms'

export const createEventSchema = createFormSchema({
  avatar: z
    .instanceof(File)
    .refine((file) => file.type.startsWith('image/'), 'Допустимы только изображения')
    .optional(),
  categories: expenseCategoriesAddSchema,
  description: z.string().optional(),
  startDate: requiredString().refine(
      (inputDate) => {
        const minDate = new Date().toISOString().split('T')[0]
        return inputDate > minDate
      },
      'Минимальная дата начала - завтрашний день'
  ),
  endDate: requiredString(),
  title: requiredString(),
}).refine(
  (values) => {
    return !values.endDate || values.endDate >= values.startDate
  },
  {
    message: 'Дата окончания не может быть раньше даты начала',
    path: ['endDate'],
  },
)
