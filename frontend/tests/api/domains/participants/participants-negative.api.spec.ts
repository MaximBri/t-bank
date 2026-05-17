import { expect, test } from '@playwright/test'

import { eventTestData } from '../events/lib/event-test-data'
import { buildEventParticipantsPath } from '../../shared/config/endpoints'
import { createApiRequestContext } from '../../shared/lib/create-api-request-context'

test.describe('API Участники negative cases', () => {
  test('GET /events/{eventId}/participants | Получение списка участников события | 401 - не авторизован', async ({ playwright }) => {
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.get(buildEventParticipantsPath(eventTestData.ids.emptyUuid))

    expect(response.status()).toBe(401)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })
})
