import { describe, it, expect } from 'vitest'
import { disputeExpenseSchema } from './schema'
import { disputeExpenseReasonMaxLength } from './constants'

describe('disputeExpenseSchema', () => {
  it('проходит валидацию с корректной причиной', () => {
    const result = disputeExpenseSchema.safeParse({ reason: 'Сумма неверна' })
    expect(result.success).toBe(true)
  })

  it('не проходит валидацию когда reason пустой', () => {
    const result = disputeExpenseSchema.safeParse({ reason: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.reason
      expect(errors![0]).toBe('Укажите причину оспаривания')
    }
  })

  it('не проходит валидацию когда reason отсутствует', () => {
    const result = disputeExpenseSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('не проходит валидацию когда reason превышает максимальную длину', () => {
    const longReason = 'a'.repeat(disputeExpenseReasonMaxLength + 1)
    const result = disputeExpenseSchema.safeParse({ reason: longReason })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.reason
      expect(errors![0]).toBe(`Максимум ${disputeExpenseReasonMaxLength} символа`)
    }
  })

  it('проходит валидацию когда reason ровно максимальной длины', () => {
    const exactReason = 'a'.repeat(disputeExpenseReasonMaxLength)
    const result = disputeExpenseSchema.safeParse({ reason: exactReason })
    expect(result.success).toBe(true)
  })
})
