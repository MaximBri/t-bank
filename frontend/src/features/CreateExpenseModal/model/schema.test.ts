import { describe, it, expect } from 'vitest'
import { createExpenseSchema } from './schema'

const makeFile = (type: string, size = 1024) => {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], 'test-file', { type })
}

describe('createExpenseSchema', () => {
  it('passes with valid required data', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: 500,
      category: 'Питание',
      participants: ['user1', 'user2'],
    })
    expect(result.success).toBe(true)
  })

  it('passes with all optional fields provided', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: 500,
      category: 'Питание',
      participants: ['user1'],
      comment: 'Ресторан',
      checkImage: makeFile('image/jpeg'),
    })
    expect(result.success).toBe(true)
  })

  it('fails when title is empty', () => {
    const result = createExpenseSchema.safeParse({
      title: '',
      amount: 500,
      category: 'Питание',
      participants: ['user1'],
    })
    expect(result.success).toBe(false)
  })

  it('fails when amount is zero', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: 0,
      category: 'Питание',
      participants: ['user1'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.amount
      expect(errors![0]).toBe('Сумма должна быть положительной')
    }
  })

  it('fails when amount is negative', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: -100,
      category: 'Питание',
      participants: ['user1'],
    })
    expect(result.success).toBe(false)
  })

  it('fails when amount is non-numeric string', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: 'not-a-number',
      category: 'Питание',
      participants: ['user1'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.amount
      expect(errors![0]).toBe('Введите корректную сумму')
    }
  })

  it('parses numeric string as number', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: '250',
      category: 'Питание',
      participants: ['user1'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.amount).toBe(250)
    }
  })

  it('fails when category is empty', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: 500,
      category: '',
      participants: ['user1'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.category
      expect(errors![0]).toBe('Выберите категорию для расхода')
    }
  })

  it('fails when participants array is empty', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: 500,
      category: 'Питание',
      participants: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.participants
      expect(errors![0]).toBe('Выберите хотя бы одного участника')
    }
  })

  it('fails when checkImage has invalid mime type', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: 500,
      category: 'Питание',
      participants: ['user1'],
      checkImage: makeFile('text/plain'),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.checkImage
      expect(errors![0]).toBe('Недопустимый формат файла')
    }
  })

  it('fails when checkImage exceeds 5MB', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: 500,
      category: 'Питание',
      participants: ['user1'],
      checkImage: makeFile('image/jpeg', 6 * 1024 * 1024),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.checkImage
      expect(errors![0]).toBe('Размер файла должен быть не больше 5 МБ')
    }
  })

  it('passes without checkImage (optional)', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: 500,
      category: 'Питание',
      participants: ['user1'],
      checkImage: undefined,
    })
    expect(result.success).toBe(true)
  })
})
