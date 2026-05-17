import { expect, test } from '@playwright/test'

import { buildCreateEventPayload, eventTestData } from './lib/event-test-data'
import { API_ENDPOINTS, buildEventPath } from '../../shared/config/endpoints'
import { createApiRequestContext } from '../../shared/lib/create-api-request-context'

test.describe('API События negative cases', () => {
  test('GET /events/user/events | Получение списка событий пользователя | 401 - не авторизован', async ({ playwright }) => {
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.get(API_ENDPOINTS.EVENTS_USER_EVENTS)

    expect(response.status()).toBe(401)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })

  test('POST /events | Создание нового события | 401 - не авторизован', async ({ playwright }) => {
    const { eventPrefixes: { anonymous } } = eventTestData
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.post(API_ENDPOINTS.EVENTS, {
      data: buildCreateEventPayload(anonymous),
    })

    expect(response.status()).toBe(401)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })

  test('PATCH /events/{eventId} | Редактирование события | 401 - не авторизован', async ({ playwright }) => {
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.patch(buildEventPath(eventTestData.ids.emptyUuid), {
      data: buildCreateEventPayload(eventTestData.eventPrefixes.update),
    })

    expect(response.status()).toBe(401)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })
})
