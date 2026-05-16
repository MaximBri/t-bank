import { describe, it, expect } from 'vitest'
import { formatExpenseDate } from './format-expense-date'

describe('formatExpenseDate', () => {
  it('форматирует ISO-дату в дд.ММ.гггг, ЧЧ:мм', () => {
    const result = formatExpenseDate('2026-05-16T14:30:00.000Z')
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{4},?\s*\d{2}:\d{2}/)
  })

  it('возвращает исходную строку при невалидной дате', () => {
    const result = formatExpenseDate('not-a-date')
    expect(result).toBe('not-a-date')
  })

  it('возвращает исходную строку при пустой строке', () => {
    const result = formatExpenseDate('')
    expect(result).toBe('')
  })
})
