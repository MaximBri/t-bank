export const authE2eData = {
  validPassword: 'ValidPassword123',
  shortPassword: 'short',
  emptyString: '',
  invalidRefreshToken: 'invalid-refresh-token',
  defaultUserPrefix: 'qa_e2e_user',
  userPrefixes: {
    register: 'qa_e2e_register',
    login: 'qa_e2e_login',
    smokeHome: 'qa_smoke_home',
  },
} as const

export const authE2eConfig = {
  apiBaseUrl: process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:8081',
} as const

export function createUniqueLogin(prefix: string = authE2eData.defaultUserPrefix): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
