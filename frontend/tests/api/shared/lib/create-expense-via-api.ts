import type { APIRequestContext } from '@playwright/test'

import { buildCreateExpensePayload } from '../../domains/expenses/lib/expense-test-data'
import { buildEventExpensesPath } from '../config/endpoints'

export async function createExpenseViaApi(
  request: APIRequestContext,
  eventId: string,
  payload: ReturnType<typeof buildCreateExpensePayload> = buildCreateExpensePayload(),
) {
  const response = await request.post(buildEventExpensesPath(eventId), { data: payload })

  return {
    payload,
    response,
  }
}
