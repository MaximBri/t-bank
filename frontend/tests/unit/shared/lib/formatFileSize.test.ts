import { describe, expect, it } from 'vitest'
import { formatFileSize } from '@/shared/lib/file/formatFileSize'

describe('formatFileSize', () => {
  it('форматирует размер меньше 1 МБ в КБ', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB')
  })

  it('форматирует 500 КБ', () => {
    expect(formatFileSize(512000)).toBe('500.00 KB')
  })

  it('форматирует ровно 1 МБ', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB')
  })

  it('форматирует 2.5 МБ', () => {
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.50 MB')
  })

  it('форматирует большой файл в МБ', () => {
    expect(formatFileSize(10 * 1024 * 1024)).toBe('10.00 MB')
  })

  it('форматирует маленький файл в КБ', () => {
    expect(formatFileSize(2048)).toBe('2.00 KB')
  })

  it('граница: один байт меньше 1 МБ — возвращает КБ', () => {
    const justBelow = 1024 * 1024 - 1
    const result = formatFileSize(justBelow)
    expect(result).toContain('KB')
  })
})
