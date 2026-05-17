import { expect, test } from '@playwright/test'

import { addE2eEnvironmentMetadata } from '../../shared/config/allure-metadata'
import { authE2eData, createUniqueLogin } from '../../shared/config/auth-e2e-data'
import { registerUserViaApi } from '../../shared/lib/auth-api'
import { APP_ROUTES } from '../../shared/routes/index'

test.describe('Authentication flows', () => {
  test('user can register through UI', async ({ page, browserName }, testInfo) => {
    await addE2eEnvironmentMetadata(browserName, testInfo)

    const login = createUniqueLogin(authE2eData.userPrefixes.register)

    await page.goto(APP_ROUTES.REGISTER)

    await page.getByLabel('Логин').fill(login)
    await page
      .getByRole('textbox', { name: 'Пароль *', exact: true })
      .fill(authE2eData.validPassword)
    await page
      .getByRole('textbox', { name: 'Повторите пароль *', exact: true })
      .fill(authE2eData.validPassword)
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click()

    await expect(page).toHaveURL(APP_ROUTES.HOME)
    await expect(page.getByRole('heading', { name: 'Мои события' })).toBeVisible()
  })

  test('existing user can log in through UI', async ({ page, request, browserName }, testInfo) => {
    await addE2eEnvironmentMetadata(browserName, testInfo)

    const { login, password } = await registerUserViaApi(request, authE2eData.userPrefixes.login)

    await page.goto(APP_ROUTES.LOGIN)

    await page.getByLabel('Логин').fill(login)
    await page.getByRole('textbox', { name: 'Пароль *', exact: true }).fill(password)
    await page.getByRole('button', { name: 'Войти' }).click()

    await expect(page).toHaveURL(APP_ROUTES.HOME)
    await expect(page.getByRole('heading', { name: 'Мои события' })).toBeVisible()
  })
})
