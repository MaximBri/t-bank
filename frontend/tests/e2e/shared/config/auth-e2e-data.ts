export const authE2eData = {
  validPassword: 'ValidPassword123',
  shortPassword: 'short',
  emptyString: '',
  invalidRefreshToken: 'invalid-refresh-token',
} as const

export const authE2eConfig = {
  apiBaseUrl: process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:8081',
} as const

export function createUniqueLogin(prefix = 'qa_e2e_user'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
