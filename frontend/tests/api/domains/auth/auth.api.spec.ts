import { expect, test } from '@playwright/test'

import { expectAuthCookies } from './lib/expect-auth-cookies'
import {
  buildLoginPayload,
  buildRegisterPayload,
  createUniqueLogin,
} from './lib/auth-test-data'
import { API_ENDPOINTS } from '../../shared/config/endpoints'
import { registerUserViaApi } from '../../shared/lib/register-user-via-api'

test.describe('API Аутентификация', () => {
  test('Регистрация нового пользователя | 201 - success', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.AUTH_REGISTER, {
      data: buildRegisterPayload(),
    })

    expect(response.status()).toBe(201)
    expectAuthCookies(response)

    const body = await response.json()
    expect(body).toEqual({
      userId: expect.any(String),
      joinedGroupId: null,
    })
  })

  test('Вход в систему | 200 - success', async ({ request }) => {
    const registerPayload = buildRegisterPayload({ login: createUniqueLogin('qa_auth_login') })
    const registerResponse = await request.post(API_ENDPOINTS.AUTH_REGISTER, { data: registerPayload })
    expect(registerResponse.status()).toBe(201)

    const response = await request.post(API_ENDPOINTS.AUTH_LOGIN, {
      data: buildLoginPayload({
        login: registerPayload.login,
        password: registerPayload.password,
      }),
    })

    expect(response.status()).toBe(200)
    expectAuthCookies(response)
  })

  test('Проверка текущей сессии | 200 - success', async ({ request }) => {
    const { payload: registerPayload, response: registerResponse } = await registerUserViaApi(request, {
      login: createUniqueLogin('qa_auth_me'),
    })
    expect(registerResponse.status()).toBe(201)

    const response = await request.get(API_ENDPOINTS.AUTH_ME)

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      login: registerPayload.login,
    })
  })

  test('Обновление Access Token | 200 - success', async ({ request }) => {
    const { response: registerResponse } = await registerUserViaApi(request, {
      login: createUniqueLogin('qa_auth_refresh'),
    })
    expect(registerResponse.status()).toBe(201)

    const response = await request.post(API_ENDPOINTS.AUTH_REFRESH)

    expect(response.status()).toBe(200)
    expectAuthCookies(response)
  })

  test('Выход из системы | 204 - success', async ({ request }) => {
    const { response: registerResponse } = await registerUserViaApi(request, {
      login: createUniqueLogin('qa_auth_logout'),
    })
    expect(registerResponse.status()).toBe(201)

    const response = await request.post(API_ENDPOINTS.AUTH_LOGOUT)

    expect(response.status()).toBe(204)
    expect(await response.text()).toBe('')

    const meResponse = await request.get(API_ENDPOINTS.AUTH_ME)
    expect(meResponse.status()).toBe(401)
    expect(await meResponse.text()).toBe('')
  })
})
