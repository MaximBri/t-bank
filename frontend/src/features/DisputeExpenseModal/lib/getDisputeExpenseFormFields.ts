import { createTextAreaField } from '@/shared/lib/forms'

import type { DisputeExpenseFormFields, DisputeExpenseFormValues } from '../model/types.ts'
import {
  disputeExpenseFieldInputClassName,
  disputeExpenseFieldLabelClassName,
  disputeExpenseReasonMaxLength,
} from '../model/constants.ts'

export const getDisputeExpenseFormFields = (): DisputeExpenseFormFields => {
  const reasonField = createTextAreaField<DisputeExpenseFormValues>({
    name: 'reason',
    type: 'textarea',
    label: 'Причина оспаривания',
    placeholder: 'Дополнительная информация о расходе...',
    labelClassName: disputeExpenseFieldLabelClassName,
    fieldClassName: disputeExpenseFieldInputClassName,
    rows: 5,
    required: true,
    withoutClearButton: true,
    rules: {
      maxLength: {
        value: disputeExpenseReasonMaxLength,
        message: `Максимум ${disputeExpenseReasonMaxLength} символа`,
      },
    },
  })

  return {
    reasonField,
  }
}
