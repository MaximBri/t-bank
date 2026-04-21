import type { CreateEventFormValues } from './types.ts'

export const defaultExpenseCategories = ['Транспорт', 'Проживание', 'Питание', 'Развлечения']
export const createEventFormDefaultValues: CreateEventFormValues = {
  avatar: undefined,
  categories: defaultExpenseCategories,
  description: '',
  endDate: undefined,
  startDate: '',
  title: '',
}

export const createEventFieldLabelClassName = 'text-body sm:text-h3-d font-medium text-primary'
export const createEventFieldInputClassName =
  'border-secondary bg-input-primary px-[16px] py-[10px] text-body text-medium border-[2px] rounded-md'
