import type { z } from 'zod'

import { disputeExpenseSchema } from './schema.ts'

export type DisputeExpenseFormValues = z.infer<typeof disputeExpenseSchema>
