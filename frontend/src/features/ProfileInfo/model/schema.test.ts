import { describe, it, expect } from 'vitest'
import { profileSchema } from './schema'

describe('profileSchema', () => {
  it('проходит валидацию с корректными данными', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
    })
    expect(result.success).toBe(true)
  })

  it('проходит валидацию когда firstName пустая строка (без .min)', () => {
    const result = profileSchema.safeParse({
      firstName: '',
      lastName: 'Иванов',
    })
    expect(result.success).toBe(true)
  })

  it('проходит валидацию когда lastName пустая строка (без .min)', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: '',
    })
    expect(result.success).toBe(true)
  })

  it('проходит валидацию когда firstName и lastName равны null (nullable)', () => {
    const result = profileSchema.safeParse({
      firstName: null,
      lastName: null,
    })
    expect(result.success).toBe(true)
  })

  it('проходит валидацию с опциональным avatar-файлом', () => {
    const imageFile = new File([new ArrayBuffer(100)], 'photo.jpg', { type: 'image/jpeg' })
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
      avatar: imageFile,
    })
    expect(result.success).toBe(true)
  })

  it('проходит валидацию когда avatar не задан (необязательное поле)', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
      avatar: undefined,
    })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда avatar не File', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
      avatar: 'not-a-file',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.avatar
      expect(errors).toBeDefined()
    }
  })

  it('не проходит валидацию когда firstName не строка и не null', () => {
    const result = profileSchema.safeParse({
      firstName: 123,
      lastName: 'Иванов',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.firstName
      expect(errors).toBeDefined()
    }
  })

  it('не проходит валидацию когда отсутствуют обязательные поля', () => {
    const result = profileSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
