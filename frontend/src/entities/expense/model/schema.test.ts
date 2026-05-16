import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { expenseCategoriesAddSchema } from './schema'

describe('expenseCategoriesAddSchema', () => {
  it('принимает непустой массив строк', () => {
    const result = expenseCategoriesAddSchema.safeParse(['Транспорт'])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(['Транспорт'])
    }
  })

  it('принимает несколько категорий', () => {
    const categories = ['Транспорт', 'Проживание', 'Питание']
    const result = expenseCategoriesAddSchema.safeParse(categories)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(categories)
    }
  })

  it('отклоняет пустой массив', () => {
    const result = expenseCategoriesAddSchema.safeParse([])
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Добавьте хотя бы одну категорию')
    }
  })

  it('отклоняет дубликаты категорий', () => {
    const result = expenseCategoriesAddSchema.safeParse(['Транспорт', 'Питание', 'Транспорт'])
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Категории не должны повторяться')
    }
  })

  it('отклоняет не массив', () => {
    const result = expenseCategoriesAddSchema.safeParse('not an array')
    expect(result.success).toBe(false)
  })

  it('отклоняет массив с не-строковыми элементами', () => {
    const result = expenseCategoriesAddSchema.safeParse(['Транспорт', 123, 'Питание'])
    expect(result.success).toBe(false)
  })

  it('правильно обрабатывает пробельные строки (пространство - это строка)', () => {
    // requiredString() принимает строки только если они не пусты, пробелы это валидная строка
    const result = expenseCategoriesAddSchema.safeParse(['  ', 'Питание'])
    // Пробелы будут приняты как валидная строка, так как requiredString() проверяет только на пустоту
    expect(result.success).toBe(true)
  })

  it('работает с длинным списком уникальных категорий', () => {
    const categories = Array.from({ length: 10 }, (_, i) => `Категория ${i + 1}`)
    const result = expenseCategoriesAddSchema.safeParse(categories)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(10)
    }
  })

  it('детектирует дубликаты в конце массива', () => {
    const result = expenseCategoriesAddSchema.safeParse(['A', 'B', 'C', 'A'])
    expect(result.success).toBe(false)
  })

  it('детектирует дубликаты в начале массива', () => {
    const result = expenseCategoriesAddSchema.safeParse(['A', 'A', 'B', 'C'])
    expect(result.success).toBe(false)
  })
})
