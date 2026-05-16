import { describe, it, expect } from 'vitest'
import { formatNotificationDate } from './format-notification-date'

describe('formatNotificationDate', () => {
  it('formats valid ISO date to dd.MM HH:mm', () => {
    const result = formatNotificationDate('2026-05-16T14:30:00.000Z')
    expect(result).toMatch(/\d{2}\.\d{2},?\s*\d{2}:\d{2}/)
  })

  it('returns original string for invalid date', () => {
    const result = formatNotificationDate('not-a-date')
    expect(result).toBe('not-a-date')
  })

  it('returns original string for empty string', () => {
    const result = formatNotificationDate('')
    expect(result).toBe('')
  })
})
