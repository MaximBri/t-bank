import { describe, it, expect } from 'vitest'
import { signInByCredentialsSchema } from './schema'

describe('signInByCredentialsSchema', () => {
  it('passes with valid data', () => {
    const result = signInByCredentialsSchema.safeParse({
      login: 'user123',
      password: 'secret',
    })
    expect(result.success).toBe(true)
  })

  it('fails when login is empty', () => {
    const result = signInByCredentialsSchema.safeParse({
      login: '',
      password: 'secret',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const loginErrors = result.error.flatten().fieldErrors.login
      expect(loginErrors).toBeDefined()
      expect(loginErrors![0]).toBe('Введите логин')
    }
  })

  it('fails when password is empty', () => {
    const result = signInByCredentialsSchema.safeParse({
      login: 'user123',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordErrors = result.error.flatten().fieldErrors.password
      expect(passwordErrors).toBeDefined()
      expect(passwordErrors![0]).toBe('Введите пароль')
    }
  })

  it('fails when login is missing', () => {
    const result = signInByCredentialsSchema.safeParse({ password: 'secret' })
    expect(result.success).toBe(false)
  })

  it('fails when password is missing', () => {
    const result = signInByCredentialsSchema.safeParse({ login: 'user123' })
    expect(result.success).toBe(false)
  })

  it('fails with wrong types', () => {
    const result = signInByCredentialsSchema.safeParse({ login: 123, password: true })
    expect(result.success).toBe(false)
  })
})
