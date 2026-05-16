import { expect, test } from '@playwright/test'

import { createUniqueLogin } from '../auth/lib/auth-test-data'
import { buildCreateEventPayload, eventTestData } from './lib/event-test-data'
import { API_ENDPOINTS, buildEventPath } from '../../shared/config/endpoints'
import { createEventViaApi } from '../../shared/lib/create-event-via-api'
import { registerUserViaApi } from '../../shared/lib/register-user-via-api'

test.describe('API События', () => {
  test('GET /events/user/events | Получение списка событий пользователя | 200 - success', async ({ request }) => {
    const { response: registerResponse } = await registerUserViaApi(request, {
      login: createUniqueLogin(eventTestData.loginPrefixes.list),
    })
    expect(registerResponse.status()).toBe(201)

    const response = await request.get(API_ENDPOINTS.EVENTS_USER_EVENTS)

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      events: expect.any(Array),
    })
  })

  test('POST /events | Создание нового события | 201 - success', async ({ request }) => {
    const { response: registerResponse } = await registerUserViaApi(request, {
      login: createUniqueLogin(eventTestData.loginPrefixes.create),
    })
    expect(registerResponse.status()).toBe(201)

    const { payload, response } = await createEventViaApi(
      request,
      buildCreateEventPayload(eventTestData.eventPrefixes.create),
    )

    expect(response.status()).toBe(201)
    await expect(response.json()).resolves.toMatchObject({
      title: payload.title,
    })
  })

  test('GET /events/{eventId} | Получение информации о событии | 200 - success', async ({ request }) => {
    const { response: registerResponse } = await registerUserViaApi(request, {
      login: createUniqueLogin(eventTestData.loginPrefixes.get),
    })
    expect(registerResponse.status()).toBe(201)

    const { payload, response: createResponse } = await createEventViaApi(
      request,
      buildCreateEventPayload(eventTestData.eventPrefixes.get),
    )
    expect(createResponse.status()).toBe(201)

    const createdEvent = await createResponse.json()
    const response = await request.get(buildEventPath(createdEvent.id))

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      id: createdEvent.id,
      title: payload.title,
    })
  })

  test('PATCH /events/{eventId} | Редактирование события | 200 - success', async ({ request }) => {
    const { response: registerResponse } = await registerUserViaApi(request, {
      login: createUniqueLogin(eventTestData.loginPrefixes.update),
    })
    expect(registerResponse.status()).toBe(201)

    const { response: createResponse } = await createEventViaApi(
      request,
      buildCreateEventPayload(eventTestData.eventPrefixes.create),
    )
    expect(createResponse.status()).toBe(201)

    const createdEvent = await createResponse.json()
    const updatePayload = buildCreateEventPayload(eventTestData.eventPrefixes.update)
    const response = await request.patch(buildEventPath(createdEvent.id), {
      data: updatePayload,
    })

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      id: createdEvent.id,
      title: updatePayload.title,
      description: updatePayload.description,
    })
  })
})
