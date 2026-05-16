import { expect, test } from '@playwright/test'

import { authE2eConfig, authE2eData, createUniqueLogin } from './config/auth-e2e-data'

test.describe('Authentication flows', () => {
  test('user can register through UI', async ({ page }) => {
    const login = createUniqueLogin('qa_e2e_register')

    await page.goto('/register')

    await page.getByLabel('Логин').fill(login)
    await page.getByLabel('Пароль').fill(authE2eData.validPassword)
    await page.getByLabel('Повторите пароль').fill(authE2eData.validPassword)
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Мои события' })).toBeVisible()
  })

  test('existing user can log in through UI', async ({ page, request }) => {
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
    await page.getByLabel('Пароль').fill(authE2eData.validPassword)
    await page.getByRole('button', { name: 'Войти' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Мои события' })).toBeVisible()
  })
})
