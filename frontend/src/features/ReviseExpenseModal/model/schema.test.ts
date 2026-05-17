import { describe, it, expect } from 'vitest'
import { reviseExpenseSchema } from './schema'
import { reviseCommentMaxLength } from './constants'

const makeFile = (type: string, size = 1024) => {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], 'test-file', { type })
}

describe('reviseExpenseSchema', () => {
  it('проходит валидацию с корректными данными', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: 100,
      category: 'Транспорт',
      checkImage: makeFile('image/jpeg'),
    })
    expect(result.success).toBe(true)
  })

  it('проходит валидацию когда amount — числовая строка', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: '150.50',
      category: 'Транспорт',
      checkImage: makeFile('image/png'),
    })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда comment пустой', () => {
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

  it('не проходит валидацию когда comment превышает максимальную длину', () => {
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

  it('не проходит валидацию когда amount равен нулю', () => {
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

  it('не проходит валидацию когда amount отрицательный', () => {
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

  it('не проходит валидацию когда amount — нечисловая строка', () => {
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

  it('не проходит валидацию когда category пустой', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: 100,
      category: '',
      checkImage: makeFile('image/jpeg'),
    })
    expect(result.success).toBe(false)
  })

  it('не проходит валидацию когда checkImage имеет недопустимый MIME-тип', () => {
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

  it('не проходит валидацию когда checkImage превышает 5 МБ', () => {
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

  it('проходит валидацию с checkImage в формате pdf', () => {
    const result = reviseExpenseSchema.safeParse({
      comment: 'Правильная сумма',
      amount: 100,
      category: 'Транспорт',
      checkImage: makeFile('application/pdf'),
    })
    expect(result.success).toBe(true)
  })
})
