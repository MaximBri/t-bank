import { expect, test } from '@playwright/test'

import { expectAuthCookies } from './config/auth-helpers'
import {
  authTestData,
  buildLoginPayload,
  buildRegisterPayload,
  createUniqueLogin,
} from './config/auth-test-data'

test.describe('Authentication API', () => {
  test('POST /auth/register returns 201 and auth cookies', async ({ request }) => {
    const response = await request.post('/auth/register', {
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

  test('POST /auth/register returns 409 for duplicate login', async ({ request }) => {
    const payload = buildRegisterPayload({ login: createUniqueLogin('qa_auth_duplicate') })

    const firstResponse = await request.post('/auth/register', { data: payload })
    expect(firstResponse.status()).toBe(201)

    const duplicateResponse = await request.post('/auth/register', { data: payload })
    expect(duplicateResponse.status()).toBe(409)
    await expect(duplicateResponse.json()).resolves.toMatchObject({
      status: 409,
    })
  })

  test('POST /auth/register returns 400 for empty password', async ({ request }) => {
    const response = await request.post('/auth/register', {
      data: buildRegisterPayload({ password: authTestData.emptyString }),
    })

    expect(response.status()).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      status: 400,
    })
  })

  test('POST /auth/register returns 400 for empty login', async ({ request }) => {
    const response = await request.post('/auth/register', {
      data: buildRegisterPayload({ login: authTestData.emptyString }),
    })

    expect(response.status()).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      status: 400,
    })
  })

  test('POST /auth/register returns 400 for short password', async ({ request }) => {
    const response = await request.post('/auth/register', {
      data: buildRegisterPayload({ password: authTestData.shortPassword }),
    })

    expect(response.status()).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      status: 400,
    })
  })

  test('POST /auth/login returns 200 and auth cookies', async ({ request }) => {
    const registerPayload = buildRegisterPayload({ login: createUniqueLogin('qa_auth_login') })
    const registerResponse = await request.post('/auth/register', { data: registerPayload })
    expect(registerResponse.status()).toBe(201)

    const response = await request.post('/auth/login', {
      data: buildLoginPayload({
        login: registerPayload.login,
        password: registerPayload.password,
      }),
    })

    expect(response.status()).toBe(200)
    expectAuthCookies(response)
  })

  test('POST /auth/login returns 401 for invalid credentials', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: buildLoginPayload({
        login: createUniqueLogin('qa_auth_missing'),
      }),
    })

    expect(response.status()).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      status: 401,
    })
  })

  test('POST /auth/login returns 400 for empty password', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: buildLoginPayload({ password: authTestData.emptyString }),
    })

    expect(response.status()).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      status: 400,
    })
  })

  test('POST /auth/login returns 400 for empty login', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: buildLoginPayload({ login: authTestData.emptyString }),
    })

    expect(response.status()).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      status: 400,
    })
  })

  test('GET /auth/me returns 200 for authenticated session', async ({ request }) => {
    const registerPayload = buildRegisterPayload({ login: createUniqueLogin('qa_auth_me') })
    const registerResponse = await request.post('/auth/register', { data: registerPayload })
    expect(registerResponse.status()).toBe(201)

    const response = await request.get('/auth/me')

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      login: registerPayload.login,
    })
  })

  test('GET /auth/me returns 401 for anonymous session', async ({ playwright }) => {
    const anonymousRequest = await playwright.request.newContext({
      baseURL: process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:8081',
      extraHTTPHeaders: {
        Accept: 'application/json',
      },
    })

    const response = await anonymousRequest.get('/auth/me')

    expect(response.status()).toBe(401)
    // await expect(response.json()).resolves.toMatchObject({
    //   status: 401,
    // })
    expect(await response.text()).toBe('')
    await anonymousRequest.dispose()
  })

  test('POST /auth/refresh returns 200 for valid refresh token', async ({ request }) => {
    const registerResponse = await request.post('/auth/register', {
      data: buildRegisterPayload({ login: createUniqueLogin('qa_auth_refresh') }),
    })
    expect(registerResponse.status()).toBe(201)

    const response = await request.post('/auth/refresh')

    expect(response.status()).toBe(200)
    expectAuthCookies(response)
  })

  test('POST /auth/refresh returns 401 for invalid refresh token', async ({ playwright }) => {
    const unauthenticatedRequest = await playwright.request.newContext({
      baseURL: process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:8081',
      extraHTTPHeaders: {
        Accept: 'application/json',
        Cookie: `refreshToken=${authTestData.invalidRefreshToken}`,
      },
    })

    const response = await unauthenticatedRequest.post('/auth/refresh')

    expect(response.status()).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      status: 401,
    })

    await unauthenticatedRequest.dispose()
  })
})
