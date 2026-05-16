import { describe, it, expect } from 'vitest'
import { reviseExpenseSchema } from './schema'
import { reviseCommentMaxLength } from './constants'

const makeFile = (type: string, size = 1024) => {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], 'test-file', { type })
}

describe('reviseExpenseSchema', () => {
  it('passes with valid data', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: 100,
      category: 'Транспорт',
      checkImage: makeFile('image/jpeg'),
    })
    expect(result.success).toBe(true)
  })

  it('passes when amount is a numeric string', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: '150.50',
      category: 'Транспорт',
      checkImage: makeFile('image/png'),
    })
    expect(result.success).toBe(true)
  })

  it('fails when comment is empty', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: '',
      amount: 100,
      category: 'Транспорт',
      checkImage: makeFile('image/jpeg'),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.comment
      expect(errors).toBeDefined()
    }
  })

  it('fails when comment exceeds max length', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'a'.repeat(reviseCommentMaxLength + 1),
      amount: 100,
      category: 'Транспорт',
      checkImage: makeFile('image/jpeg'),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.comment
      expect(errors![0]).toBe(`Максимум ${reviseCommentMaxLength} символов`)
    }
  })

  it('fails when amount is zero', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: 0,
      category: 'Транспорт',
      checkImage: makeFile('image/jpeg'),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.amount
      expect(errors![0]).toBe('Сумма должна быть положительной')
    }
  })

  it('fails when amount is negative', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: -50,
      category: 'Транспорт',
      checkImage: makeFile('image/jpeg'),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.amount
      expect(errors![0]).toBe('Сумма должна быть положительной')
    }
  })

  it('fails when amount is non-numeric string', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: 'abc',
      category: 'Транспорт',
      checkImage: makeFile('image/jpeg'),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.amount
      expect(errors![0]).toBe('Введите корректную сумму')
    }
  })

  it('fails when category is empty', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: 100,
      category: '',
      checkImage: makeFile('image/jpeg'),
    })
    expect(result.success).toBe(false)
  })

  it('fails when checkImage has invalid mime type', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: 100,
      category: 'Транспорт',
      checkImage: makeFile('text/plain'),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.checkImage
      expect(errors![0]).toBe('Недопустимый формат файла')
    }
  })

  it('fails when checkImage exceeds 5MB', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: 100,
      category: 'Транспорт',
      checkImage: makeFile('image/jpeg', 6 * 1024 * 1024),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.checkImage
      expect(errors![0]).toBe('Размер файла должен быть не больше 5 МБ')
    }
  })

  it('passes with pdf checkImage', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: 100,
      category: 'Транспорт',
      checkImage: makeFile('application/pdf'),
    })
    expect(result.success).toBe(true)
  })
})
