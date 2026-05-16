import { expect, type APIRequestContext } from '@playwright/test'

import { authE2eConfig, authE2eData, createUniqueLogin } from '../config/auth-e2e-data'
import { API_ENDPOINTS } from '../routes'

export type RegisteredUser = {
  login: string
  password: string
}

export async function registerUserViaApi(
  request: APIRequestContext,
  prefix: string = authE2eData.defaultUserPrefix,
): Promise<RegisteredUser> {
  const login = createUniqueLogin(prefix)

  const response = await request.post(`${authE2eConfig.apiBaseUrl}${API_ENDPOINTS.AUTH_REGISTER}`, {
    data: {
      login,
      password: authE2eData.validPassword,
      inviteCode: '',
    },
  })

  expect(response.status()).toBe(201)

  return {
    login,
    password: authE2eData.validPassword,
  }
}

export async function loginViaApi(
  request: APIRequestContext,
  user: RegisteredUser,
): Promise<void> {
  const response = await request.post(`${authE2eConfig.apiBaseUrl}${API_ENDPOINTS.AUTH_LOGIN}`, {
    data: {
      login: user.login,
      password: user.password,
    },
  })

  expect(response.status()).toBe(200)
}
