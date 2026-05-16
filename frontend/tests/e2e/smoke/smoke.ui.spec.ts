import { test } from '@playwright/test'

import { CreateEventModal } from '../pages/event/create-event-modal'
import { HomePage } from '../pages/home'
import { LoginPage } from '../pages/login'
import { ProfilePage } from '../pages/profile'
import { RegisterPage } from '../pages/register'
import { addE2eEnvironmentMetadata } from '../shared/config/allure-metadata'
import { authE2eData } from '../shared/config/auth-e2e-data'
import { registerUserViaApi } from '../shared/lib/auth-api'

test('[SMK-20][TC-UI-01] Открытие страницы логина без авторизации', async ({
  page,
  browserName,
}, testInfo) => {
  await addE2eEnvironmentMetadata(browserName, testInfo)
  const loginPage = new LoginPage(page)

  await loginPage.open()
  await loginPage.expectOpened()
})

test('[SMK-21][TC-UI-02] Открытие страницы регистрации без авторизации', async ({
  page,
  browserName,
}, testInfo) => {
  await addE2eEnvironmentMetadata(browserName, testInfo)
  const registerPage = new RegisterPage(page)

  await registerPage.open()
  await registerPage.expectOpened()
})

test('[SMK-22][TC-UI-03] Открытие главной страницы "Мои события"', async ({
  page,
  request,
  browserName,
}, testInfo) => {
  const { smokeHome } = authE2eData.userPrefixes

  await addE2eEnvironmentMetadata(browserName, testInfo)

  const loginPage = new LoginPage(page)
  const homePage = new HomePage(page)
  const { login, password } = await registerUserViaApi(request, smokeHome)

  await loginPage.open()
  await loginPage.login(login, password)
  await homePage.expectOpened()
})

test('[SMK-23][TC-UI-05] Открытие экрана создания события', async ({
  page,
  request,
  browserName,
}, testInfo) => {
  const { smokeHome } = authE2eData.userPrefixes

  await addE2eEnvironmentMetadata(browserName, testInfo)

  const loginPage = new LoginPage(page)
  const homePage = new HomePage(page)
  const createEventModal = new CreateEventModal(page)
  const { login, password } = await registerUserViaApi(request, smokeHome)

  await loginPage.open()
  await loginPage.login(login, password)
  await homePage.expectOpened()

  await homePage.openCreateEventModal()
  await createEventModal.expectOpened()
})

test('[SMK-25][TC-UI-16] Открытие страницы личного кабинета', async ({
  page,
  request,
  browserName,
}, testInfo) => {
  const { smokeHome } = authE2eData.userPrefixes

  await addE2eEnvironmentMetadata(browserName, testInfo)

  const loginPage = new LoginPage(page)
  const profilePage = new ProfilePage(page)
  const { login, password } = await registerUserViaApi(request, smokeHome)

  await loginPage.open()
  await loginPage.login(login, password)
  await profilePage.openFromHeader()
  await profilePage.expectOpened()
})
