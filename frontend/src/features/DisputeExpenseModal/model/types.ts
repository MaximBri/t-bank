import type {z} from 'zod'

import {disputeExpenseSchema} from './schema.ts'
import type {FormFieldConfig} from "@/shared/lib/forms";

export type DisputeExpenseFormValues = z.infer<typeof disputeExpenseSchema>

export type DisputeExpenseFormFields = {
    reasonField: FormFieldConfig<DisputeExpenseFormValues>
}