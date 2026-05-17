import { describe, it, expect } from 'vitest'
import { signInByCredentialsSchema } from './schema'

describe('signInByCredentialsSchema', () => {
  it('проходит валидацию с корректными данными', () => {
    const result = signInByCredentialsSchema.safeParse({
      login: 'user123',
      password: 'secret',
    })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда login пустой', () => {
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

  it('не проходит валидацию когда password пустой', () => {
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

  it('не проходит валидацию когда login отсутствует', () => {
    const result = signInByCredentialsSchema.safeParse({ password: 'secret' })
    expect(result.success).toBe(false)
  })

  it('не проходит валидацию когда password отсутствует', () => {
    const result = signInByCredentialsSchema.safeParse({ login: 'user123' })
    expect(result.success).toBe(false)
  })

  it('не проходит валидацию с неверными типами данных', () => {
    const result = signInByCredentialsSchema.safeParse({ login: 123, password: true })
    expect(result.success).toBe(false)
  })
})
