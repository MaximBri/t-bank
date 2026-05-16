import { describe, expect, it } from 'vitest'
import {
  createFormSchema,
  emailSchema,
  numberFromInput,
  optionalNumberFromInput,
  requiredString,
} from './schema'

describe('requiredString', () => {
  const schema = requiredString('Поле обязательно')

  it('принимает непустую строку', () => {
    expect(schema.safeParse('hello').success).toBe(true)
  })

  it('отклоняет пустую строку', () => {
    const result = schema.safeParse('')
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('Поле обязательно')
  })

  it('отклоняет undefined', () => {
    expect(schema.safeParse(undefined).success).toBe(false)
  })
})

describe('emailSchema', () => {
  const schema = emailSchema()

  it('принимает корректный email', () => {
    expect(schema.safeParse('user@example.com').success).toBe(true)
  })

  it('отклоняет строку без @', () => {
    expect(schema.safeParse('notanemail').success).toBe(false)
  })

  it('отклоняет пустую строку', () => {
    expect(schema.safeParse('').success).toBe(false)
  })
})

describe('numberFromInput', () => {
  const schema = numberFromInput()

  it('принимает числовую строку', () => {
    expect(schema.safeParse('42').success).toBe(true)
    expect(schema.parse('42')).toBe(42)
  })

  it('принимает число', () => {
    expect(schema.parse(100)).toBe(100)
  })

  it('отклоняет нечисловую строку', () => {
    expect(schema.safeParse('abc').success).toBe(false)
  })

  it('отклоняет пустую строку', () => {
    expect(schema.safeParse('').success).toBe(false)
  })
})

describe('optionalNumberFromInput', () => {
  const schema = optionalNumberFromInput()

  it('возвращает undefined для пустой строки', () => {
    expect(schema.parse('')).toBeUndefined()
  })

  it('возвращает undefined для null', () => {
    expect(schema.parse(null)).toBeUndefined()
  })

  it('парсит числовую строку', () => {
    expect(schema.parse('15')).toBe(15)
  })
})

describe('createFormSchema', () => {
  it('создаёт Zod-объект из переданных полей', () => {
    const schema = createFormSchema({ name: requiredString() })
    expect(schema.safeParse({ name: 'John' }).success).toBe(true)
    expect(schema.safeParse({ name: '' }).success).toBe(false)
  })
})
