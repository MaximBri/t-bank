import { expect, test } from '@playwright/test'

test.describe('Авторизация', () => {
  test('страница логина открывается', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /войти/i })).toBeVisible()
  })

  test('показывает ошибки валидации при пустом сабмите на /login', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /войти/i }).click()
    await expect(page.getByText(/введите логин/i)).toBeVisible({ timeout: 3000 })
    await expect(page.getByText(/введите пароль/i)).toBeVisible({ timeout: 3000 })
  })

  test('страница регистрации открывается', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('button', { name: /зарегистрироваться/i })).toBeVisible()
  })

  test('неавторизованный пользователь редиректится с / на /login', async ({ page }) => {
    // Clear any persisted auth state so we are definitely unauthenticated
    await page.goto('/login')
    await page.evaluate(() => localStorage.removeItem('user-store'))
    await page.goto('/')
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })
})
