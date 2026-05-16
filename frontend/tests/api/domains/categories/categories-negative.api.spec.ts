import { expect, test } from '@playwright/test'

import { API_ENDPOINTS } from '../../shared/config/endpoints'
import { createApiRequestContext } from '../../shared/lib/create-api-request-context'

test.describe('API Категории negative cases', () => {
  test('GET /events/categories | Получение дефолтных категорий | 401 - не авторизован', async ({ playwright }) => {
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.get(API_ENDPOINTS.EVENTS_CATEGORIES_DEFAULT)

    expect(response.status()).toBe(401)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })
})
