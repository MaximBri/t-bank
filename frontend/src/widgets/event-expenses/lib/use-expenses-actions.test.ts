import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useExpensesActions } from './use-expenses-actions'
import { useApproveExpense, useDeleteExpense, useRejectExpense } from '@/entities/expense'

vi.mock('@/entities/expense', () => ({
  useApproveExpense: vi.fn(),
  useRejectExpense: vi.fn(),
  useDeleteExpense: vi.fn(),
}))

const mockApprove = vi.fn()
const mockReject = vi.fn()
const mockDelete = vi.fn()

beforeEach(() => {
  mockApprove.mockClear()
  mockReject.mockClear()
  mockDelete.mockClear()
  vi.mocked(useApproveExpense).mockReturnValue({ mutate: mockApprove, isPending: false } as any)
  vi.mocked(useRejectExpense).mockReturnValue({ mutate: mockReject, isPending: false } as any)
  vi.mocked(useDeleteExpense).mockReturnValue({ mutate: mockDelete, isPending: false } as any)
})

describe('useExpensesActions', () => {
  it('вызывает approve.mutate с правильными аргументами', () => {
    const { result } = renderHook(() => useExpensesActions({ eventId: 'ev-1' }))
    act(() => { result.current.approve('exp-1') })
    expect(mockApprove).toHaveBeenCalledWith({ eventId: 'ev-1', expenseId: 'exp-1' })
  })

  it('не вызывает approve когда eventId не передан', () => {
    const { result } = renderHook(() => useExpensesActions({ eventId: undefined }))
    act(() => { result.current.approve('exp-1') })
    expect(mockApprove).not.toHaveBeenCalled()
  })

  it('вызывает reject.mutate с правильными аргументами', () => {
    const { result } = renderHook(() => useExpensesActions({ eventId: 'ev-1' }))
    act(() => { result.current.reject('exp-1') })
    expect(mockReject).toHaveBeenCalledWith({ eventId: 'ev-1', expenseId: 'exp-1' })
  })

  it('не вызывает reject когда eventId не передан', () => {
    const { result } = renderHook(() => useExpensesActions({ eventId: undefined }))
    act(() => { result.current.reject('exp-1') })
    expect(mockReject).not.toHaveBeenCalled()
  })

  it('вызывает delete.mutate после подтверждения', () => {
    vi.stubGlobal('confirm', vi.fn(() => true))
    const { result } = renderHook(() => useExpensesActions({ eventId: 'ev-1' }))
    act(() => { result.current.remove({ id: 'exp-1', title: 'Ужин', description: '' } as any) })
    expect(mockDelete).toHaveBeenCalledWith({ eventId: 'ev-1', expenseId: 'exp-1' })
    vi.unstubAllGlobals()
  })

  it('не вызывает delete.mutate когда пользователь отменил', () => {
    vi.stubGlobal('confirm', vi.fn(() => false))
    const { result } = renderHook(() => useExpensesActions({ eventId: 'ev-1' }))
    act(() => { result.current.remove({ id: 'exp-1', title: 'Ужин', description: '' } as any) })
    expect(mockDelete).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('isMutating=true когда один из хуков isPending', () => {
    vi.mocked(useApproveExpense).mockReturnValue({ mutate: mockApprove, isPending: true } as any)
    const { result } = renderHook(() => useExpensesActions({ eventId: 'ev-1' }))
    expect(result.current.isMutating).toBe(true)
  })
})
