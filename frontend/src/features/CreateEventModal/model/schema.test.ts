import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { createEventSchema } from './schema'

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
  it('проходит валидацию с минимально необходимыми данными', () => {
    const result = createEventSchema().safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it('проходит валидацию с заполненными необязательными полями', () => {
    const result = createEventSchema().safeParse({
      ...validBase,
      description: 'Описание поездки',
    })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда title пустой', () => {
    const result = createEventSchema().safeParse({ ...validBase, title: '' })
    expect(result.success).toBe(false)
  })

  it('не проходит валидацию когда startDate — сегодня (не завтра)', () => {
    const result = createEventSchema().safeParse({ ...validBase, startDate: MOCK_TODAY })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.startDate
      expect(errors![0]).toBe('Минимальная дата начала - завтрашний день')
    }
  })

  it('не проходит валидацию когда startDate в прошлом', () => {
    const result = createEventSchema().safeParse({ ...validBase, startDate: YESTERDAY })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.startDate
      expect(errors![0]).toBe('Минимальная дата начала - завтрашний день')
    }
  })

  it('не проходит валидацию когда startDate пустой', () => {
    const result = createEventSchema().safeParse({ ...validBase, startDate: '' })
    expect(result.success).toBe(false)
  })

  it('не проходит валидацию когда endDate раньше startDate', () => {
    const result = createEventSchema().safeParse({
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

  it('проходит валидацию когда endDate равен startDate', () => {
    const result = createEventSchema().safeParse({
      ...validBase,
      startDate: TOMORROW,
      endDate: TOMORROW,
    })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда массив categories пустой', () => {
    const result = createEventSchema().safeParse({ ...validBase, categories: [] })
    expect(result.success).toBe(false)
  })

  it('не проходит валидацию когда categories содержат дубликаты', () => {
    const result = createEventSchema().safeParse({
      ...validBase,
      categories: ['Транспорт', 'Транспорт'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.categories
      expect(errors![0]).toBe('Категории не должны повторяться')
    }
  })

  it('не проходит валидацию когда avatar не является изображением', () => {
    const pdfFile = new File([new ArrayBuffer(100)], 'doc.pdf', { type: 'application/pdf' })
    const result = createEventSchema().safeParse({ ...validBase, avatar: pdfFile })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.avatar
      expect(errors![0]).toBe('Допустимы только изображения')
    }
  })

  it('проходит валидацию когда avatar является файлом изображения', () => {
    const imageFile = new File([new ArrayBuffer(100)], 'photo.jpg', { type: 'image/jpeg' })
    const result = createEventSchema().safeParse({ ...validBase, avatar: imageFile })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда avatar превышает 3 МБ', () => {
    const largeImageFile = new File([new ArrayBuffer(4 * 1024 * 1024)], 'large-photo.jpg', {
      type: 'image/jpeg',
    })
    const result = createEventSchema().safeParse({ ...validBase, avatar: largeImageFile })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.avatar
      expect(errors![0]).toBe('Размер файла должен быть не больше 3 МБ')
    }
  })

  it('проходит валидацию когда avatar не задан (необязательное поле)', () => {
    const result = createEventSchema().safeParse({ ...validBase, avatar: undefined })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда отсутствуют обязательные поля', () => {
    const result = createEventSchema().safeParse({})
    expect(result.success).toBe(false)
  })
})
