import { expect, test } from '@playwright/test'

import { addE2eEnvironmentMetadata } from '../shared/config/allure-metadata'
import { authE2eConfig, authE2eData, createUniqueLogin } from '../shared/config/auth-e2e-data'

test.describe('Authentication flows', () => {
  test('user can register through UI', async ({ page, browserName }, testInfo) => {
    await addE2eEnvironmentMetadata(browserName, testInfo)

    const login = createUniqueLogin('qa_e2e_register')

    await page.goto('/register')

    await page.getByLabel('Логин').fill(login)
    await page.getByRole('textbox', { name: 'Пароль *', exact: true }).fill(authE2eData.validPassword)
    await page.getByRole('textbox', { name: 'Повторите пароль *', exact: true }).fill(authE2eData.validPassword)
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Мои события' })).toBeVisible()
  })

  test('existing user can log in through UI', async ({ page, request, browserName }, testInfo) => {
    await addE2eEnvironmentMetadata(browserName, testInfo)

    const login = createUniqueLogin('qa_e2e_login')

    const registerResponse = await request.post(`${authE2eConfig.apiBaseUrl}/auth/register`, {
      data: {
        login,
        password: authE2eData.validPassword,
        inviteCode: '',
      },
    })

    expect(registerResponse.status()).toBe(201)

    await page.goto('/login')

    await page.getByLabel('Логин').fill(login)
    await page.getByRole('textbox', { name: 'Пароль *', exact: true }).fill(authE2eData.validPassword)
    await page.getByRole('button', { name: 'Войти' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Мои события' })).toBeVisible()
  })
})
