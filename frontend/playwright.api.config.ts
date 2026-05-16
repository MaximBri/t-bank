import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/api',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: './.artifacts/api/test-results',
  reporter: [
    ['html', { outputFolder: './.artifacts/api/playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: './.artifacts/api/allure-results' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://127.0.0.1:8081',
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    trace: 'on-first-retry',
  },
})
