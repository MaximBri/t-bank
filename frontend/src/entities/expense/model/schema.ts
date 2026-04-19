import { z } from 'zod'

import { requiredString } from '@/shared/lib/forms'

export const expenseCategoriesSchema = z
  .array(requiredString())
  .min(1, 'Добавьте хотя бы одну категорию')
  .refine((categories) => new Set(categories).size === categories.length, {
    message: 'Категории не должны повторяться',
  })
