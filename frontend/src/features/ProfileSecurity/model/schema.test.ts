import { describe, it, expect } from 'vitest'
import { changePasswordSchema } from './schema'

describe('changePasswordSchema', () => {
  it('passes with valid matching passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword1',
      newPassword: 'newPassword1',
      confirmPassword: 'newPassword1',
    })
    expect(result.success).toBe(true)
  })

  it('fails when currentPassword is empty', () => {
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

  it('fails when newPassword is too short', () => {
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

  it('fails when confirmPassword is empty', () => {
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

  it('fails when passwords do not match', () => {
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

  it('fails when required fields are missing', () => {
    const result = changePasswordSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
