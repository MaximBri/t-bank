import type { DisputeExpenseFormValues } from './types.ts'

export const disputeExpenseFormDefaultValues: DisputeExpenseFormValues = {
  reason: '',
}

export const disputeExpenseFieldLabelClassName = 'text-body font-normal'

export const disputeExpenseFieldInputClassName =
  'h-[150px] resize-none rounded-md px-[16px] py-[14px] text-body font-normal placeholder:text-placeholder'

export const disputeExpenseReasonMaxLength = 64
