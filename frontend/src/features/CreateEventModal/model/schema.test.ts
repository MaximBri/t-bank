import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { createEventSchema } from './schema'

// Use a fixed "today" to make date-based tests deterministic
const MOCK_TODAY = '2026-05-16'
const TOMORROW = '2026-05-17'
const DAY_AFTER_TOMORROW = '2026-05-18'
const YESTERDAY = '2026-05-15'

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-16T12:00:00.000Z'))
})

afterAll(() => {
  vi.useRealTimers()
})

const validBase = {
  title: 'Летний отпуск',
  startDate: TOMORROW,
  endDate: DAY_AFTER_TOMORROW,
  categories: ['Транспорт', 'Питание'],
}

describe('createEventSchema', () => {
  it('passes with valid minimal data', () => {
    const result = createEventSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it('passes with optional fields included', () => {
    const result = createEventSchema.safeParse({
      ...validBase,
      description: 'Описание поездки',
    })
    expect(result.success).toBe(true)
  })

  it('fails when title is empty', () => {
    const result = createEventSchema.safeParse({ ...validBase, title: '' })
    expect(result.success).toBe(false)
  })

  it('fails when startDate is today (not tomorrow)', () => {
    const result = createEventSchema.safeParse({ ...validBase, startDate: MOCK_TODAY })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.startDate
      expect(errors![0]).toBe('Минимальная дата начала - завтрашний день')
    }
  })

  it('fails when startDate is in the past', () => {
    const result = createEventSchema.safeParse({ ...validBase, startDate: YESTERDAY })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.startDate
      expect(errors![0]).toBe('Минимальная дата начала - завтрашний день')
    }
  })

  it('fails when startDate is empty', () => {
    const result = createEventSchema.safeParse({ ...validBase, startDate: '' })
    expect(result.success).toBe(false)
  })

  it('fails when endDate is before startDate', () => {
    const result = createEventSchema.safeParse({
      ...validBase,
      startDate: DAY_AFTER_TOMORROW,
      endDate: TOMORROW,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.endDate
      expect(errors![0]).toBe('Дата окончания не может быть раньше даты начала')
    }
  })

  it('passes when endDate equals startDate', () => {
    const result = createEventSchema.safeParse({
      ...validBase,
      startDate: TOMORROW,
      endDate: TOMORROW,
    })
    expect(result.success).toBe(true)
  })

  it('fails when categories array is empty', () => {
    const result = createEventSchema.safeParse({ ...validBase, categories: [] })
    expect(result.success).toBe(false)
  })

  it('fails when categories contain duplicates', () => {
    const result = createEventSchema.safeParse({
      ...validBase,
      categories: ['Транспорт', 'Транспорт'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.categories
      expect(errors![0]).toBe('Категории не должны повторяться')
    }
  })

  it('fails when avatar is not an image', () => {
    const pdfFile = new File([new ArrayBuffer(100)], 'doc.pdf', { type: 'application/pdf' })
    const result = createEventSchema.safeParse({ ...validBase, avatar: pdfFile })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.avatar
      expect(errors![0]).toBe('Допустимы только изображения')
    }
  })

  it('passes when avatar is an image file', () => {
    const imageFile = new File([new ArrayBuffer(100)], 'photo.jpg', { type: 'image/jpeg' })
    const result = createEventSchema.safeParse({ ...validBase, avatar: imageFile })
    expect(result.success).toBe(true)
  })

  it('passes when avatar is undefined (optional)', () => {
    const result = createEventSchema.safeParse({ ...validBase, avatar: undefined })
    expect(result.success).toBe(true)
  })

  it('fails when required fields are missing', () => {
    const result = createEventSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
