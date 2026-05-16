import { expect, test } from '@playwright/test'

import { authTestData, createUniqueLogin } from '../auth/lib/auth-test-data'
import { buildChangePasswordPayload, buildUpdateProfilePayload } from './lib/profile-test-data'
import { API_ENDPOINTS } from '../../shared/config/endpoints'
import { registerUserViaApi } from '../../shared/lib/register-user-via-api'

test.describe('API Профиль', () => {
  test('GET /me | Получение данных профиля | 200 - success', async ({ request }) => {
    const login = createUniqueLogin('qa_profile_me')
    const { response: registerResponse } = await registerUserViaApi(request, { login })
    expect(registerResponse.status()).toBe(201)

    const response = await request.get(API_ENDPOINTS.PROFILE_ME)

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      login,
    })
  })

  test('PATCH /me | Редактирование профиля | 200 - success', async ({ request }) => {
    const { response: registerResponse } = await registerUserViaApi(request, {
      login: createUniqueLogin('qa_profile_patch'),
    })
    expect(registerResponse.status()).toBe(201)

    const payload = buildUpdateProfilePayload()
    const response = await request.patch(API_ENDPOINTS.PROFILE_ME, { data: payload })

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      login: payload.login,
      first_name: payload.first_name,
      second_name: payload.second_name,
    })
  })

  test('POST /me/password | Изменение пароля | 204 - success', async ({ request }) => {
    const password = authTestData.validPassword
    const { payload: registerPayload, response: registerResponse } = await registerUserViaApi(request, {
      login: createUniqueLogin('qa_profile_password'),
      password,
    })
    expect(registerResponse.status()).toBe(201)

    const response = await request.post(API_ENDPOINTS.PROFILE_PASSWORD, {
      data: buildChangePasswordPayload(registerPayload.password),
    })

    expect(response.status()).toBe(204)
    expect(await response.text()).toBe('')
  })
})
