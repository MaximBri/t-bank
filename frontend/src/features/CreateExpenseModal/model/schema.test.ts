import { describe, it, expect } from 'vitest'
import { createExpenseSchema } from './schema'

const makeFile = (type: string, size = 1024) => {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], 'test-file', { type })
}

describe('createExpenseSchema', () => {
  it('проходит валидацию с корректными обязательными данными', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: 500,
      category: 'Питание',
      participants: ['user1', 'user2'],
    })
    expect(result.success).toBe(true)
  })

  it('проходит валидацию при заполнении всех необязательных полей', () => {
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

  it('не проходит валидацию когда title пустой', () => {
    const result = createExpenseSchema.safeParse({
      title: '',
      amount: 500,
      category: 'Питание',
      participants: ['user1'],
    })
    expect(result.success).toBe(false)
  })

  it('не проходит валидацию когда amount равен нулю', () => {
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

  it('не проходит валидацию когда amount отрицательный', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Обед',
      amount: -100,
      category: 'Питание',
      participants: ['user1'],
    })
    expect(result.success).toBe(false)
  })

  it('не проходит валидацию когда amount — нечисловая строка', () => {
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

  it('преобразует числовую строку в число', () => {
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

  it('не проходит валидацию когда category пустой', () => {
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

  it('не проходит валидацию когда массив participants пустой', () => {
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

  it('не проходит валидацию когда checkImage имеет недопустимый MIME-тип', () => {
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

  it('не проходит валидацию когда checkImage превышает 5 МБ', () => {
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

  it('проходит валидацию без checkImage (необязательное поле)', () => {
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
