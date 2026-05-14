import { ExpenseCategory } from '@/entities/expense'
import { z } from 'zod'
import { createExpenseSchema } from '@/features/CreateExpenseModal/model/schema.ts'
import { BaseFieldConfig, FormFieldConfig } from '@/shared/lib/forms'
import type { FieldPath, FieldValues } from 'react-hook-form'

export type ExpenseCandidate = {
  id: string
  fullName: string
  isLocked?: boolean
}

export type CreateExpenseFormValues = {
  title: string
  amount?: number
  category: ExpenseCategory
  participants: string[]
  comment?: string
  checkImage?: File
}

export type createExpenseFormInput = z.input<typeof createExpenseSchema>
export type createExpenseFormOutput = z.output<typeof createExpenseSchema>

export type ParticipantsFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldConfig<TFieldValues, TName> & {
  participants: ExpenseCandidate[]
}
export type CreateExpenseFormFields = {
  titleField: FormFieldConfig<CreateExpenseFormValues>
  amountField: FormFieldConfig<CreateExpenseFormValues>
  categoryField: FormFieldConfig<CreateExpenseFormValues>
  commentField: FormFieldConfig<CreateExpenseFormValues>
  checkImageField: FormFieldConfig<CreateExpenseFormValues>
  participantsField: ParticipantsFieldConfig<CreateExpenseFormValues>
}
