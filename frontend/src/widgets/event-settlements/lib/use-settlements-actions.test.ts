import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSettlementsActions } from './use-settlements-actions'
import { usePaySettlement } from '@/entities/settlement'

vi.mock('@/entities/settlement', () => ({
  usePaySettlement: vi.fn(),
}))

describe('useSettlementsActions', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    mockMutate.mockClear()
    vi.mocked(usePaySettlement).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any)
  })

  it('вызывает paySettlement.mutate с корректными данными', () => {
    const { result } = renderHook(() => useSettlementsActions({ eventId: 'event-1' }))
    act(() => {
      result.current.pay({ toUserId: 'user-2', amount: 500 })
    })
    expect(mockMutate).toHaveBeenCalledWith({ eventId: 'event-1', toUserId: 'user-2', amount: 500 })
  })

  it('не вызывает mutate когда eventId не определён', () => {
    const { result } = renderHook(() => useSettlementsActions({ eventId: undefined }))
    act(() => {
      result.current.pay({ toUserId: 'user-2', amount: 500 })
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('отражает isMutating из usePaySettlement', () => {
    vi.mocked(usePaySettlement).mockReturnValue({ mutate: mockMutate, isPending: true } as any)
    const { result } = renderHook(() => useSettlementsActions({ eventId: 'event-1' }))
    expect(result.current.isMutating).toBe(true)
  })
})
