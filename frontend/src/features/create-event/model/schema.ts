import { z } from 'zod'

import { createFormSchema, requiredString } from '@/shared/lib/forms'

export const createEventSchema = createFormSchema({
  avatar: z.instanceof(File).optional(),
  categories: z
    .array(requiredString())
    .min(1, 'Добавьте хотя бы одну категорию')
    .refine((categories) => new Set(categories).size === categories.length, {
      message: 'Категории не должны повторяться',
    }),
  description: z.string().optional(),
  startDate: requiredString(),
  endDate: z.string().optional(),
  title: requiredString(),
}).refine((values) => {
  return !values.endDate || values.endDate >= values.startDate
}, {
  message: 'Дата окончания не может быть раньше даты начала',
  path: ['endDate'],
})
