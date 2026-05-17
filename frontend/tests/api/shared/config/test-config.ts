export const apiTestConfig = {
  baseUrl:
    process.env.PLAYWRIGHT_API_BASE_URL ??
    (process.env.CI ? 'http://127.0.0.1:8080' : 'http://localhost:8081'),
} as const
