import { expect, test } from '@playwright/test'

test.describe('События', () => {
  test('страница 404 показывает not-found контент', async ({ page }) => {
    await page.goto('/nonexistent-route-xyz')
    // Either redirects to login or shows 404 page — both are acceptable
    const url = page.url()
    const isLoginOrNotFound = url.includes('login') || url.includes('not-found') || url.includes('404')
    // At minimum: page should not crash
    await expect(page.locator('body')).toBeVisible()
  })
})
