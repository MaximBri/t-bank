import { describe, expect, it } from 'vitest'
import { parseNumberValue } from './parseNumber'

describe('parseNumberValue', () => {
  it('парсит строковое число', () => {
    expect(parseNumberValue('42')).toBe(42)
  })

  it('парсит числовое значение', () => {
    expect(parseNumberValue(100)).toBe(100)
  })

  it('возвращает undefined для пустой строки', () => {
    expect(parseNumberValue('')).toBeUndefined()
  })

  it('возвращает undefined для null', () => {
    expect(parseNumberValue(null)).toBeUndefined()
  })

  it('возвращает undefined для undefined', () => {
    expect(parseNumberValue(undefined)).toBeUndefined()
  })

  it('возвращает undefined для NaN-строки', () => {
    expect(parseNumberValue('abc')).toBeUndefined()
  })

  it('парсит ноль', () => {
    expect(parseNumberValue('0')).toBe(0)
  })

  it('парсит отрицательное число', () => {
    expect(parseNumberValue('-10')).toBe(-10)
  })

  it('парсит дробное число с точкой', () => {
    expect(parseNumberValue('42.75')).toBe(42.75)
  })

  it('парсит дробное число с запятой', () => {
    expect(parseNumberValue('42,75')).toBe(42.75)
  })

  it('игнорирует пробелы вокруг числа', () => {
    expect(parseNumberValue(' 42,75 ')).toBe(42.75)
  })
})
