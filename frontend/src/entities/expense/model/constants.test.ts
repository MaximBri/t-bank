import { describe, expect, it } from 'vitest'

import { defaultExpenseCategories } from './constants'

describe('defaultExpenseCategories', () => {
  it('содержит четыре категории по умолчанию', () => {
    expect(defaultExpenseCategories).toHaveLength(4)
  })

  it('содержит правильные категории', () => {
    expect(defaultExpenseCategories).toEqual(['Транспорт', 'Проживание', 'Питание', 'Развлечения'])
  })

  it('первая категория - Транспорт', () => {
    expect(defaultExpenseCategories[0]).toBe('Транспорт')
  })

  it('вторая категория - Проживание', () => {
    expect(defaultExpenseCategories[1]).toBe('Проживание')
  })

  it('третья категория - Питание', () => {
    expect(defaultExpenseCategories[2]).toBe('Питание')
  })

  it('четвертая категория - Развлечения', () => {
    expect(defaultExpenseCategories[3]).toBe('Развлечения')
  })

  it('все категории - строки', () => {
    defaultExpenseCategories.forEach((category) => {
      expect(typeof category).toBe('string')
      expect(category.length).toBeGreaterThan(0)
    })
  })

  it('нет дубликатов в списке', () => {
    const uniqueCategories = new Set(defaultExpenseCategories)
    expect(uniqueCategories.size).toBe(defaultExpenseCategories.length)
  })

  it('категории не пусты', () => {
    defaultExpenseCategories.forEach((category) => {
      expect(category.trim()).not.toBe('')
    })
  })
})
