import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSettlementsActions } from './use-settlements-actions'
import { useConfirmSettlement, usePaySettlement } from '@/entities/settlement'

vi.mock('@/entities/settlement', () => ({
  useConfirmSettlement: vi.fn(),
  usePaySettlement: vi.fn(),
}))

describe('useSettlementsActions', () => {
  const mockPayMutate = vi.fn()
  const mockConfirmMutate = vi.fn()

  beforeEach(() => {
    mockPayMutate.mockClear()
    mockConfirmMutate.mockClear()
    vi.mocked(usePaySettlement).mockReturnValue({
      mutate: mockPayMutate,
      isPending: false,
    } as any)
    vi.mocked(useConfirmSettlement).mockReturnValue({
      mutate: mockConfirmMutate,
      isPending: false,
    } as any)
  })

  it('вызывает paySettlement.mutate с корректными данными', () => {
    const { result } = renderHook(() => useSettlementsActions({ eventId: 'event-1' }))
    act(() => {
      result.current.pay({ paymentId: 'payment-1' })
    })
    expect(mockPayMutate).toHaveBeenCalledWith({ eventId: 'event-1', paymentId: 'payment-1' })
  })

  it('не вызывает mutate когда eventId не определён', () => {
    const { result } = renderHook(() => useSettlementsActions({ eventId: undefined }))
    act(() => {
      result.current.pay({ paymentId: 'payment-1' })
    })
    expect(mockPayMutate).not.toHaveBeenCalled()
  })

  it('отражает isMutating из usePaySettlement', () => {
    vi.mocked(usePaySettlement).mockReturnValue({ mutate: mockPayMutate, isPending: true } as any)
    const { result } = renderHook(() => useSettlementsActions({ eventId: 'event-1' }))
    expect(result.current.isMutating).toBe(true)
  })
})
