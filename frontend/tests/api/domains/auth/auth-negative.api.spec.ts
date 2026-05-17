import { expect, test } from '@playwright/test'

import { authTestData, buildLoginPayload, buildRegisterPayload, createUniqueLogin } from './lib/auth-test-data'
import { API_ENDPOINTS } from '../../shared/config/endpoints'
import { createApiRequestContext } from '../../shared/lib/create-api-request-context'

test.describe('API Аутентификация negative cases', () => {
  test('Регистрация нового пользователя | 409 - username already exist', async ({ request }) => {
    const payload = buildRegisterPayload({ login: createUniqueLogin('qa_auth_duplicate') })

    const firstResponse = await request.post(API_ENDPOINTS.AUTH_REGISTER, { data: payload })
    expect(firstResponse.status()).toBe(201)

    const duplicateResponse = await request.post(API_ENDPOINTS.AUTH_REGISTER, { data: payload })
    expect(duplicateResponse.status()).toBe(409)
    await expect(duplicateResponse.json()).resolves.toMatchObject({
      status: 409,
    })
  })

  test('Регистрация нового пользователя | 400 - empty password', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.AUTH_REGISTER, {
      data: buildRegisterPayload({ password: authTestData.emptyString }),
    })

    expect(response.status()).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      status: 400,
    })
  })

  test('Регистрация нового пользователя | 400 - empty username', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.AUTH_REGISTER, {
      data: buildRegisterPayload({ login: authTestData.emptyString }),
    })

    expect(response.status()).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      status: 400,
    })
  })

  test('Регистрация нового пользователя | 400 - invalid password length', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.AUTH_REGISTER, {
      data: buildRegisterPayload({ password: authTestData.shortPassword }),
    })

    expect(response.status()).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      status: 400,
    })
  })

  test('Вход в систему | 401 - invalid credentials', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.AUTH_LOGIN, {
      data: buildLoginPayload({
        login: createUniqueLogin('qa_auth_missing'),
      }),
    })

    expect(response.status()).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      status: 401,
    })
  })

  test('Вход в систему | 400 - empty password', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.AUTH_LOGIN, {
      data: buildLoginPayload({ password: authTestData.emptyString }),
    })

    expect(response.status()).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      status: 400,
    })
  })

  test('Вход в систему | 400 - empty username', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.AUTH_LOGIN, {
      data: buildLoginPayload({ login: authTestData.emptyString }),
    })

    expect(response.status()).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      status: 400,
    })
  })

  test('Проверка текущей сессии | 401 - не авторизован', async ({ playwright }) => {
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.get(API_ENDPOINTS.AUTH_ME)

    expect(response.status()).toBe(401)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })

  test('Обновление Access Token | 401 - invalid refresh token', async ({ playwright }) => {
    const unauthenticatedRequest = await createApiRequestContext(playwright, {
      cookie: `refreshToken=${authTestData.invalidRefreshToken}`,
    })

    const response = await unauthenticatedRequest.post(API_ENDPOINTS.AUTH_REFRESH)

    expect(response.status()).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      status: 401,
    })

    await unauthenticatedRequest.dispose()
  })

  test('Выход из системы | 204 - anonymous session', async ({ playwright }) => {
    const anonymousRequest = await createApiRequestContext(playwright)

    const response = await anonymousRequest.post(API_ENDPOINTS.AUTH_LOGOUT)

    expect(response.status()).toBe(204)
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })
})
