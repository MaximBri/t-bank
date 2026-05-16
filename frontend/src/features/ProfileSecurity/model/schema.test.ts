import { describe, it, expect } from 'vitest'
import { changePasswordSchema } from './schema'

describe('changePasswordSchema', () => {
  it('проходит валидацию с совпадающими корректными паролями', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword1',
      newPassword: 'newPassword1',
      confirmPassword: 'newPassword1',
    })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда currentPassword пустой', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'newPassword1',
      confirmPassword: 'newPassword1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.currentPassword
      expect(errors![0]).toBe('Введите текущий пароль')
    }
  })

  it('не проходит валидацию когда newPassword слишком короткий', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword1',
      newPassword: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.newPassword
      expect(errors![0]).toBe('Пароль должен содержать минимум 8 символов')
    }
  })

  it('не проходит валидацию когда confirmPassword пустой', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword1',
      newPassword: 'newPassword1',
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.confirmPassword
      expect(errors).toBeDefined()
    }
  })

  it('не проходит валидацию когда пароли не совпадают', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword1',
      newPassword: 'newPassword1',
      confirmPassword: 'differentPassword',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.confirmPassword
      expect(errors![0]).toBe('Пароли не совпадают')
    }
  })

  it('не проходит валидацию когда отсутствуют обязательные поля', () => {
    const result = changePasswordSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
