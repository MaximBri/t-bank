import { describe, it, expect } from 'vitest'
import { profileSchema } from './schema'

describe('profileSchema', () => {
  it('проходит валидацию с корректными данными', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
      email: 'ivan@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда firstName пустой', () => {
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

  it('не проходит валидацию когда lastName пустой', () => {
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

  it('не проходит валидацию с некорректным email', () => {
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

  it('не проходит валидацию когда email пустой', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
      email: '',
    })
    expect(result.success).toBe(false)
  })

  it('не проходит валидацию когда отсутствуют обязательные поля', () => {
    const result = profileSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
