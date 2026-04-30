import type {ExpenseCategoryList} from '@/entities/expense'
import type {FormFieldConfig} from "@/shared/lib/forms";

export type CreateEventFormValues = {
  avatar?: File
  categories: ExpenseCategoryList
  description?: string
  endDate?: string
  startDate: string
  title: string
}
export type CreateEventFormFields = {
    titleField: FormFieldConfig<CreateEventFormValues>
    dateFields: [FormFieldConfig<CreateEventFormValues>, FormFieldConfig<CreateEventFormValues>]
    descriptionField: FormFieldConfig<CreateEventFormValues>
    avatarField: FormFieldConfig<CreateEventFormValues>
}