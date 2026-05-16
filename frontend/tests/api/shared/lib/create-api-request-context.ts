import type { APIRequestContext, PlaywrightWorkerArgs } from '@playwright/test'

import { apiTestConfig } from '../config/test-config'

export async function createApiRequestContext(
  playwright: PlaywrightWorkerArgs['playwright'],
  options?: {
    cookie?: string
  },
): Promise<APIRequestContext> {
  const extraHTTPHeaders: Record<string, string> = {
    Accept: 'application/json',
  }

  if (options?.cookie) {
    extraHTTPHeaders.Cookie = options.cookie
  }

  return playwright.request.newContext({
    baseURL: apiTestConfig.baseUrl,
    extraHTTPHeaders,
  })
}
