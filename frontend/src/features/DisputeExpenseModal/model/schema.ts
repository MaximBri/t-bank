import { z } from 'zod'

import { requiredString } from '@/shared/lib/forms'
import { disputeExpenseReasonMaxLength } from './constants.ts'

export const disputeExpenseSchema = z.object({
  reason: requiredString('Укажите причину оспаривания').max(disputeExpenseReasonMaxLength, {
    message: `Максимум ${disputeExpenseReasonMaxLength} символа`,
  }),
})
