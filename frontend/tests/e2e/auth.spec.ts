import { expect, test } from '@playwright/test'

test.describe('Авторизация', () => {
  test('страница логина открывается', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: /войти/i })).toBeVisible()
  })

  test('показывает ошибки валидации при пустом сабмите на /login', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /войти/i }).click()
    await expect(page.getByText(/введите логин/i)).toBeVisible({ timeout: 3000 })
    await expect(page.getByText(/введите пароль/i)).toBeVisible({ timeout: 3000 })
  })

  test('страница регистрации открывается', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: /зарегистрироваться/i })).toBeVisible()
  })

  test('неавторизованный пользователь редиректится с / на /login', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('user-store'))

    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      })
    })

    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      })
    })

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })
})
