import { describe, it, expect } from 'vitest'
import { profileSchema } from './schema'

describe('profileSchema', () => {
  it('passes with valid data', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
      email: 'ivan@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('fails when firstName is empty', () => {
    const result = profileSchema.safeParse({
      firstName: '',
      lastName: 'Иванов',
      email: 'ivan@example.com',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.firstName
      expect(errors![0]).toBe('Введите имя')
    }
  })

  it('fails when lastName is empty', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: '',
      email: 'ivan@example.com',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.lastName
      expect(errors![0]).toBe('Введите фамилию')
    }
  })

  it('fails with invalid email', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.email
      expect(errors![0]).toBe('Введите корректный email')
    }
  })

  it('fails when email is empty', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
      email: '',
    })
    expect(result.success).toBe(false)
  })

  it('fails when required fields are missing', () => {
    const result = profileSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
