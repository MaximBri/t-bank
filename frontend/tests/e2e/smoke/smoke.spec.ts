import { test } from '@playwright/test'

import { LoginPage } from '../pages/login-page'
import { RegisterPage } from '../pages/register-page'
import { addE2eEnvironmentMetadata } from '../shared/config/allure-metadata'

test('[TC-UI-01] Открытие страницы логина без авторизации', async ({ page, browserName }, testInfo) => {
  await addE2eEnvironmentMetadata(browserName, testInfo)
  const loginPage = new LoginPage(page)

  await loginPage.open()
  await loginPage.expectOpened()
})

test('[TC-UI-02] Открытие страницы регистрации без авторизации', async ({ page, browserName }, testInfo) => {
  await addE2eEnvironmentMetadata(browserName, testInfo)
  const registerPage = new RegisterPage(page)

  await registerPage.open()
  await registerPage.expectOpened()
})
