import { expect, test } from '@playwright/test'

import { authTestData } from '../auth/lib/auth-test-data'
import { buildChangePasswordPayload, buildUpdateProfilePayload } from './lib/profile-test-data'
import { API_ENDPOINTS } from '../../shared/config/endpoints'
import { createApiRequestContext } from '../../shared/lib/create-api-request-context'

test.describe('API Профиль negative cases', () => {
  test('GET /me | Получение данных профиля | 401 - не авторизован', async ({ playwright }) => {
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.get(API_ENDPOINTS.PROFILE_ME)

    expect(response.status()).toBe(401)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })

  test('PATCH /me | Редактирование профиля | 401 - не авторизован', async ({ playwright }) => {
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.patch(API_ENDPOINTS.PROFILE_ME, {
      data: buildUpdateProfilePayload('qa_profile_anon'),
    })

    expect(response.status()).toBe(401)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })

  test('POST /me/password | Изменение пароля | 401 - не авторизован', async ({ playwright }) => {
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.post(API_ENDPOINTS.PROFILE_PASSWORD, {
      data: buildChangePasswordPayload(authTestData.validPassword),
    })

    expect(response.status()).toBe(401)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })
})
