import { expect, test } from '@playwright/test'

import { createUniqueLogin } from '../auth/lib/auth-test-data'
import { buildCreateEventPayload, eventTestData } from '../events/lib/event-test-data'
import { buildCreateExpensePayload, expenseTestData } from './lib/expense-test-data'
import { buildEventExpensesPath } from '../../shared/config/endpoints'
import { createEventViaApi } from '../../shared/lib/create-event-via-api'
import { createExpenseViaApi } from '../../shared/lib/create-expense-via-api'
import { registerUserViaApi } from '../../shared/lib/register-user-via-api'

test.describe('API Расходы', () => {
  test('GET /events/{eventId}/expenses | Получение списка расходов события | 200 - success', async ({ request }) => {
    const { response: registerResponse } = await registerUserViaApi(request, {
      login: createUniqueLogin(eventTestData.loginPrefixes.expensesList),
    })
    expect(registerResponse.status()).toBe(201)

    const { response: createEventResponse } = await createEventViaApi(
      request,
      buildCreateEventPayload(eventTestData.eventPrefixes.expensesList),
    )
    expect(createEventResponse.status()).toBe(201)
    const event = await createEventResponse.json()

    const response = await request.get(buildEventExpensesPath(event.id))

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      expenses: expect.any(Array),
      eventTotalSum: expect.any(Number),
    })
  })

  test('POST /events/{eventId}/expenses | Добавление нового расхода | 201 - success', async ({ request }) => {
    const { response: registerResponse } = await registerUserViaApi(request, {
      login: createUniqueLogin(eventTestData.loginPrefixes.expensesCreate),
    })
    expect(registerResponse.status()).toBe(201)

    const { response: createEventResponse } = await createEventViaApi(
      request,
      buildCreateEventPayload(eventTestData.eventPrefixes.expensesCreate),
    )
    expect(createEventResponse.status()).toBe(201)
    const event = await createEventResponse.json()

    const { response } = await createExpenseViaApi(
      request,
      event.id,
      buildCreateExpensePayload(expenseTestData.expensePrefixes.create),
    )

    expect(response.status()).toBe(201)
    await expect(response.json()).resolves.toEqual(expect.any(String))
  })
})
