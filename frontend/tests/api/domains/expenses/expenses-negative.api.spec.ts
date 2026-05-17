import { expect, test } from '@playwright/test'

import { eventTestData } from '../events/lib/event-test-data'
import { buildCreateExpensePayload, expenseTestData } from './lib/expense-test-data'
import { buildEventExpensesPath } from '../../shared/config/endpoints'
import { createApiRequestContext } from '../../shared/lib/create-api-request-context'

test.describe('API Расходы negative cases', () => {
  test('GET /events/{eventId}/expenses | Получение списка расходов события | 401 - не авторизован', async ({ playwright }) => {
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.get(buildEventExpensesPath(eventTestData.ids.emptyUuid))

    expect(response.status()).toBe(401)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })

  test('POST /events/{eventId}/expenses | Добавление нового расхода | 401 - не авторизован', async ({ playwright }) => {
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.post(buildEventExpensesPath(eventTestData.ids.emptyUuid), {
      data: buildCreateExpensePayload(expenseTestData.expensePrefixes.anonymous),
    })

    expect(response.status()).toBe(401)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })
})
