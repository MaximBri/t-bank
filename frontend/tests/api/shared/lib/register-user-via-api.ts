import type { APIRequestContext } from '@playwright/test'

import { API_ENDPOINTS } from '../config/endpoints'
import { buildRegisterPayload } from '../../domains/auth/lib/auth-test-data'

export async function registerUserViaApi(
  request: APIRequestContext,
  overrides?: Parameters<typeof buildRegisterPayload>[0],
) {
  const payload = buildRegisterPayload(overrides)
  const response = await request.post(API_ENDPOINTS.AUTH_REGISTER, { data: payload })

  return {
    payload,
    response,
  }
}
