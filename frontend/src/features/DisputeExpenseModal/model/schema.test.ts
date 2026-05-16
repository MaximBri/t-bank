import { describe, it, expect } from 'vitest'
import { disputeExpenseSchema } from './schema'
import { disputeExpenseReasonMaxLength } from './constants'

describe('disputeExpenseSchema', () => {
  it('passes with valid reason', () => {
    const result = disputeExpenseSchema.safeParse({ reason: 'Сумма неверна' })
    expect(result.success).toBe(true)
  })

  it('fails when reason is empty', () => {
    const result = disputeExpenseSchema.safeParse({ reason: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.reason
      expect(errors![0]).toBe('Укажите причину оспаривания')
    }
  })

  it('fails when reason is missing', () => {
    const result = disputeExpenseSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('fails when reason exceeds max length', () => {
    const longReason = 'a'.repeat(disputeExpenseReasonMaxLength + 1)
    const result = disputeExpenseSchema.safeParse({ reason: longReason })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.reason
      expect(errors![0]).toBe(`Максимум ${disputeExpenseReasonMaxLength} символа`)
    }
  })

  it('passes when reason is exactly at max length', () => {
    const exactReason = 'a'.repeat(disputeExpenseReasonMaxLength)
    const result = disputeExpenseSchema.safeParse({ reason: exactReason })
    expect(result.success).toBe(true)
  })
})
