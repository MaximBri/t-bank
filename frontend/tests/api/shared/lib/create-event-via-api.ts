import type { APIRequestContext } from '@playwright/test'

import { buildCreateEventPayload } from '../../domains/events/lib/event-test-data'
import { API_ENDPOINTS } from '../config/endpoints'

export async function createEventViaApi(
  request: APIRequestContext,
  payload: ReturnType<typeof buildCreateEventPayload> = buildCreateEventPayload(),
) {
  const response = await request.post(API_ENDPOINTS.EVENTS, { data: payload })

  return {
    payload,
    response,
  }
}
