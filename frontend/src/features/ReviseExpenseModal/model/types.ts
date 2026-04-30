import {ExpenseCategory} from '@/entities/expense'
import {reviseExpenseSchema} from '@/features/ReviseExpenseModal/model/schema.ts'
import {z} from 'zod'
import type {FieldPath, FieldValues} from 'react-hook-form'
import {BaseFieldConfig, FormFieldConfig} from '@/shared/lib/forms'

export type ReviseExpenseFormValues = {
  amount?: number
  category: ExpenseCategory
  comment?: string
  checkImage: File
}

export type reviseExpenseFormInput = z.input<typeof reviseExpenseSchema>
export type reviseExpenseFormOutput = z.output<typeof reviseExpenseSchema>

export type ReviseFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldConfig<TFieldValues, TName> & {
  accept: string
}

export type ReviseExpenseFormFields = {
    amountField: FormFieldConfig<ReviseExpenseFormValues>
    categoryField: FormFieldConfig<ReviseExpenseFormValues>
    commentField: FormFieldConfig<ReviseExpenseFormValues>
    checkField: ReviseFieldConfig<ReviseExpenseFormValues>
}