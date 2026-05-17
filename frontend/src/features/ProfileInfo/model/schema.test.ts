import { describe, it, expect } from 'vitest'
import { profileSchema } from './schema'

describe('profileSchema', () => {
  it('проходит валидацию с корректными данными', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
    })
    expect(result.success).toBe(true)
  })

  it('допускает null в firstName и lastName', () => {
    const result = profileSchema.safeParse({
      firstName: null,
      lastName: null,
    })
    expect(result.success).toBe(true)
  })

  it('avatar — необязательное поле', () => {
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
    })
    expect(result.success).toBe(true)
  })

  it('принимает File в поле avatar', () => {
    const file = new File(['data'], 'avatar.png', { type: 'image/png' })
    const result = profileSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
      avatar: file,
    })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда firstName не строка и не null', () => {
    const result = profileSchema.safeParse({
      firstName: 123,
      lastName: 'Иванов',
    })
    expect(result.success).toBe(false)
  })
})
