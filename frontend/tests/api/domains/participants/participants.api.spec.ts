import { expect, test } from '@playwright/test'

import { createUniqueLogin } from '../auth/lib/auth-test-data'
import { buildCreateEventPayload, eventTestData } from '../events/lib/event-test-data'
import { buildEventParticipantsPath } from '../../shared/config/endpoints'
import { createEventViaApi } from '../../shared/lib/create-event-via-api'
import { registerUserViaApi } from '../../shared/lib/register-user-via-api'

test.describe('API Участники', () => {
  test('GET /events/{eventId}/participants | Получение списка участников события | 200 - success', async ({ request }) => {
    const ownerLogin = createUniqueLogin(eventTestData.loginPrefixes.participantsOwner)
    const { response: registerResponse } = await registerUserViaApi(request, {
      login: ownerLogin,
    })
    expect(registerResponse.status()).toBe(201)

    const { response: createEventResponse } = await createEventViaApi(
      request,
      buildCreateEventPayload(eventTestData.eventPrefixes.participants),
    )
    expect(createEventResponse.status()).toBe(201)
    const event = await createEventResponse.json()

    const response = await request.get(buildEventParticipantsPath(event.id))

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      participants: expect.any(Array),
    })
  })
})
