import { describe, expect, it } from 'vitest'

import { formatDateRange } from './format-date-range'

describe('formatDateRange', () => {
  describe('без даты окончания', () => {
    it('форматирует одиночную дату', () => {
      const result = formatDateRange('2025-02-14T00:00:00')
      expect(result).toBe('С 14 февраля 2025')
    })

    it('корректно форматирует января', () => {
      const result = formatDateRange('2025-01-01T00:00:00')
      expect(result).toBe('С 1 января 2025')
    })

    it('корректно форматирует декабря', () => {
      const result = formatDateRange('2025-12-31T00:00:00')
      expect(result).toBe('С 31 декабря 2025')
    })

    it('корректно форматирует май', () => {
      const result = formatDateRange('2025-05-15T00:00:00')
      expect(result).toBe('С 15 мая 2025')
    })

    it('игнорирует время в дате', () => {
      const result = formatDateRange('2025-02-14T12:30:45')
      expect(result).toBe('С 14 февраля 2025')
    })
  })

  describe('с датой окончания в одном месяце и году', () => {
    it('форматирует диапазон в одном месяце', () => {
      const result = formatDateRange('2025-02-10T00:00:00', '2025-02-15T00:00:00')
      expect(result).toBe('10 - 15 февраля 2025')
    })

    it('форматирует диапазон в одном дне', () => {
      const result = formatDateRange('2025-02-14T00:00:00', '2025-02-14T00:00:00')
      expect(result).toBe('14 февраля 2025')
    })

    it('форматирует диапазон в январе', () => {
      const result = formatDateRange('2025-01-05T00:00:00', '2025-01-20T00:00:00')
      expect(result).toBe('5 - 20 января 2025')
    })
  })

  describe('с датой окончания в разных месяцах одного года', () => {
    it('форматирует диапазон с переходом месяца', () => {
      const result = formatDateRange('2025-02-25T00:00:00', '2025-03-05T00:00:00')
      expect(result).toBe('25 февраля - 5 марта 2025')
    })

    it('форматирует диапазон с переходом с января на февраль', () => {
      const result = formatDateRange('2025-01-28T00:00:00', '2025-02-03T00:00:00')
      expect(result).toBe('28 января - 3 февраля 2025')
    })

    it('форматирует диапазон с переходом на декабрь', () => {
      const result = formatDateRange('2025-11-25T00:00:00', '2025-12-05T00:00:00')
      expect(result).toBe('25 ноября - 5 декабря 2025')
    })
  })

  describe('с датой окончания в разных годах', () => {
    it('форматирует диапазон с переходом года', () => {
      const result = formatDateRange('2024-12-25T00:00:00', '2025-01-05T00:00:00')
      expect(result).toBe('25 декабря 2024 - 5 января 2025')
    })

    it('форматирует диапазон с двумя годами разницей', () => {
      const result = formatDateRange('2024-12-31T00:00:00', '2025-01-01T00:00:00')
      expect(result).toBe('31 декабря 2024 - 1 января 2025')
    })

    it('форматирует диапазон через несколько месяцев в разных годах', () => {
      const result = formatDateRange('2024-11-15T00:00:00', '2025-02-28T00:00:00')
      expect(result).toBe('15 ноября 2024 - 28 февраля 2025')
    })
  })

  describe('граничные случаи', () => {
    it('обрабатывает дату с заканчивающимся временем с нулями', () => {
      const result = formatDateRange('2025-02-14T00:00:00', '2025-02-20T23:59:59')
      expect(result).toBe('14 - 20 февраля 2025')
    })

    it('обрабатывает первый день месяца', () => {
      const result = formatDateRange('2025-03-01T00:00:00')
      expect(result).toBe('С 1 марта 2025')
    })

    it('обрабатывает последний день месяца (февраль)', () => {
      const result = formatDateRange('2025-02-28T00:00:00')
      expect(result).toBe('С 28 февраля 2025')
    })

    it('обрабатывает последний день месяца (март)', () => {
      const result = formatDateRange('2025-03-31T00:00:00')
      expect(result).toBe('С 31 марта 2025')
    })
  })

  describe('все месяцы года', () => {
    it('январь', () => {
      expect(formatDateRange('2025-01-15T00:00:00')).toContain('января')
    })

    it('февраль', () => {
      expect(formatDateRange('2025-02-15T00:00:00')).toContain('февраля')
    })

    it('март', () => {
      expect(formatDateRange('2025-03-15T00:00:00')).toContain('марта')
    })

    it('апрель', () => {
      expect(formatDateRange('2025-04-15T00:00:00')).toContain('апреля')
    })

    it('май', () => {
      expect(formatDateRange('2025-05-15T00:00:00')).toContain('мая')
    })

    it('июнь', () => {
      expect(formatDateRange('2025-06-15T00:00:00')).toContain('июня')
    })

    it('июль', () => {
      expect(formatDateRange('2025-07-15T00:00:00')).toContain('июля')
    })

    it('август', () => {
      expect(formatDateRange('2025-08-15T00:00:00')).toContain('августа')
    })

    it('сентябрь', () => {
      expect(formatDateRange('2025-09-15T00:00:00')).toContain('сентября')
    })

    it('октябрь', () => {
      expect(formatDateRange('2025-10-15T00:00:00')).toContain('октября')
    })

    it('ноябрь', () => {
      expect(formatDateRange('2025-11-15T00:00:00')).toContain('ноября')
    })

    it('декабрь', () => {
      expect(formatDateRange('2025-12-15T00:00:00')).toContain('декабря')
    })
  })
})
