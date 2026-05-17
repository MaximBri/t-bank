import { describe, it, expect } from 'vitest'
import { formatNotificationDate } from './format-notification-date'

describe('formatNotificationDate', () => {
  it('форматирует корректную ISO-дату в формат dd.MM HH:mm', () => {
    const result = formatNotificationDate('2026-05-16T14:30:00.000Z')
    expect(result).toMatch(/\d{2}\.\d{2},?\s*\d{2}:\d{2}/)
  })

  it('возвращает исходную строку при некорректной дате', () => {
    const result = formatNotificationDate('not-a-date')
    expect(result).toBe('not-a-date')
  })

  it('возвращает исходную строку при пустой строке', () => {
    const result = formatNotificationDate('')
    expect(result).toBe('')
  })
})
