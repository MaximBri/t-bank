import type { ExpenseCategoryList } from '@/entities/expense'

export type CreateEventFormValues = {
  avatar?: File
  categories: ExpenseCategoryList
  description?: string
  endDate?: string
  startDate: string
  title: string
}
