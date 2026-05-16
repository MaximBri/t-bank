import { describe, it, expect } from 'vitest'
import { signUpByCredentialsSchema } from './schema'

describe('signUpByCredentialsSchema', () => {
  it('passes with valid matching passwords', () => {
    const result = signUpByCredentialsSchema.safeParse({
      login: 'user123',
      password: 'password123',
      passwordRepeat: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('fails when login is too short', () => {
    const result = signUpByCredentialsSchema.safeParse({
      login: 'ab',
      password: 'password123',
      passwordRepeat: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const loginErrors = result.error.flatten().fieldErrors.login
      expect(loginErrors![0]).toBe('Логин должен содержать минимум 3 символа')
    }
  })

  it('fails when login is empty', () => {
    const result = signUpByCredentialsSchema.safeParse({
      login: '',
      password: 'password123',
      passwordRepeat: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const loginErrors = result.error.flatten().fieldErrors.login
      expect(loginErrors![0]).toBe('Введите логин')
    }
  })

  it('fails when password is too short', () => {
    const result = signUpByCredentialsSchema.safeParse({
      login: 'user123',
      password: 'short',
      passwordRepeat: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordErrors = result.error.flatten().fieldErrors.password
      expect(passwordErrors![0]).toBe('Пароль должен содержать минимум 8 символов')
    }
  })

  it('fails when passwords do not match', () => {
    const result = signUpByCredentialsSchema.safeParse({
      login: 'user123',
      password: 'password123',
      passwordRepeat: 'differentPassword',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const repeatErrors = result.error.flatten().fieldErrors.passwordRepeat
      expect(repeatErrors![0]).toBe('Пароли не совпадают')
    }
  })

  it('fails when passwordRepeat is empty', () => {
    const result = signUpByCredentialsSchema.safeParse({
      login: 'user123',
      password: 'password123',
      passwordRepeat: '',
    })
    expect(result.success).toBe(false)
  })

  it('fails when required fields are missing', () => {
    const result = signUpByCredentialsSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
