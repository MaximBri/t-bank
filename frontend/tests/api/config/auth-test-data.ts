export const authTestData = {
  validPassword: 'ValidPassword123',
  shortPassword: 'short',
  emptyString: '',
  invalidRefreshToken: 'invalid-refresh-token',
} as const

export function createUniqueLogin(prefix = 'qa_auth_user'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function buildRegisterPayload(overrides?: Partial<{
  login: string
  password: string
  firstName: string
  secondName: string
  inviteCode: string
}>) {
  return {
    login: createUniqueLogin(),
    password: authTestData.validPassword,
    inviteCode: '',
    ...overrides,
  }
}

export function buildLoginPayload(overrides?: Partial<{
  login: string
  password: string
}>) {
  return {
    login: createUniqueLogin(),
    password: authTestData.validPassword,
    ...overrides,
  }
}
