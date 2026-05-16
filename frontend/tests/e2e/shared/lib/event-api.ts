import { expect, type APIRequestContext } from '@playwright/test'

import type { CreateEventDto, EventResponse } from '@/entities/event/model/types'

import { authE2eConfig } from '../config/auth-e2e-data'
import { buildCreateEventPayload } from '../config/event-e2e-data'
import { API_ENDPOINTS } from '../routes'

export async function createEventViaApi(
  request: APIRequestContext,
  payload: CreateEventDto = buildCreateEventPayload(),
): Promise<EventResponse> {
  const response = await request.post(`${authE2eConfig.apiBaseUrl}${API_ENDPOINTS.EVENTS}`, {
    data: payload,
  })

  expect(response.status()).toBe(201)

  return await response.json()
}
