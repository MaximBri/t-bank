import { describe, it, expect } from 'vitest'
import { signUpByCredentialsSchema } from './schema'

describe('signUpByCredentialsSchema', () => {
  it('проходит валидацию с совпадающими корректными паролями', () => {
    const result = signUpByCredentialsSchema.safeParse({
      login: 'user123',
      password: 'password123',
      passwordRepeat: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда login слишком короткий', () => {
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

  it('не проходит валидацию когда login пустой', () => {
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

  it('не проходит валидацию когда password слишком короткий', () => {
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

  it('не проходит валидацию когда пароли не совпадают', () => {
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

  it('не проходит валидацию когда passwordRepeat пустой', () => {
    const result = signUpByCredentialsSchema.safeParse({
      login: 'user123',
      password: 'password123',
      passwordRepeat: '',
    })
    expect(result.success).toBe(false)
  })

  it('не проходит валидацию когда отсутствуют обязательные поля', () => {
    const result = signUpByCredentialsSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
