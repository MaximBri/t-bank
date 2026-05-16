import { APIResponse, expect } from '@playwright/test'

export function expectAuthCookies(response: APIResponse) {
  const setCookie = response.headersArray()
    .filter((header) => header.name.toLowerCase() === 'set-cookie')
    .map((header) => header.value)

  expect(setCookie.some((value) => value.startsWith('accessToken='))).toBeTruthy()
  expect(setCookie.some((value) => value.startsWith('refreshToken='))).toBeTruthy()
}
