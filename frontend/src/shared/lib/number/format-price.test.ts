import { describe, expect, it } from 'vitest'
import { formatPrice } from './format-price'

describe('formatPrice', () => {
  it('форматирует целое положительное число', () => {
    const result = formatPrice(1000)
    expect(result).toContain('1')
    expect(result).toContain('000')
    expect(result).toContain('₽')
  })

  it('форматирует ноль', () => {
    const result = formatPrice(0)
    expect(result).toContain('0')
    expect(result).toContain('₽')
  })

  it('форматирует отрицательное число', () => {
    const result = formatPrice(-500)
    expect(result).toContain('500')
    expect(result).toContain('₽')
  })

  it('форматирует большое число с разделителем тысяч', () => {
    const result = formatPrice(1000000)
    expect(result).toMatch(/1[\s .,]000[\s .,]000/)
  })

  it('не показывает дробные знаки', () => {
    const result = formatPrice(99.99)
    expect(result).not.toMatch(/\d+[.,]\d+/)
  })
})
