import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('возвращает начальное значение сразу', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('не обновляет значение до истечения delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'first' },
    })

    rerender({ value: 'second' })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current).toBe('first')
  })

  it('обновляет значение после истечения delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'first' },
    })

    rerender({ value: 'second' })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('second')
  })

  it('сбрасывает таймер при повторном обновлении', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'first' },
    })

    rerender({ value: 'second' })
    act(() => { vi.advanceTimersByTime(200) })

    rerender({ value: 'third' })
    act(() => { vi.advanceTimersByTime(200) })

    expect(result.current).toBe('first')

    act(() => { vi.advanceTimersByTime(100) })

    expect(result.current).toBe('third')
  })
})
