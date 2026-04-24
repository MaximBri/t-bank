import {ExpenseCategory} from '@/entities/expense'
import {z} from 'zod'
import {createExpenseSchema} from '@/features/CreateExpenseModal/model/schema.ts'
import {BaseFieldConfig} from "@/shared/lib/forms";
import type {FieldPath, FieldValues} from "react-hook-form";

export type ExpenseCandidate = {
    id: number
    fullName: string
}

export type CreateExpenseFormValues = {
    title: string,
    amount?: number | undefined,
    category: ExpenseCategory,
    participants: number[],
    comment?: string,
    checkImage?: File | undefined,
}

export type createExpenseFormInput = z.input<typeof createExpenseSchema>
export type createExpenseFormOutput = z.output<typeof createExpenseSchema>

export type ParticipantsFieldConfig<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldConfig<TFieldValues, TName> & {
    participants: ExpenseCandidate[]
}