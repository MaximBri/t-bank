import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { createElement, type ReactNode } from 'react'
import { useSectionChange } from '@/shared/lib/page-sections/use-section-change'

const sections = ['overview', 'members', 'settings'] as const
type Section = (typeof sections)[number]

function wrapper({ children }: { children: ReactNode }) {
  return createElement(MemoryRouter, { initialEntries: ['/'] }, children)
}

function wrapperWithQuery(query: string) {
  return function ({ children }: { children: ReactNode }) {
    return createElement(MemoryRouter, { initialEntries: [`/?${query}`] }, children)
  }
}

describe('useSectionChange', () => {
  it('возвращает defaultSection когда строка запроса пуста', () => {
    const { result } = renderHook(
      () =>
        useSectionChange<Section>({
          defaultSection: 'overview',
          sections: [...sections],
        }),
      { wrapper },
    )
    expect(result.current.activeSection).toBe('overview')
  })

  it('возвращает секцию из строки запроса когда она валидна', () => {
    const { result } = renderHook(
      () =>
        useSectionChange<Section>({
          defaultSection: 'overview',
          sections: [...sections],
        }),
      { wrapper: wrapperWithQuery('section=members') },
    )
    expect(result.current.activeSection).toBe('members')
  })

  it('возвращает defaultSection когда значение из строки запроса невалидно', () => {
    const { result } = renderHook(
      () =>
        useSectionChange<Section>({
          defaultSection: 'overview',
          sections: [...sections],
        }),
      { wrapper: wrapperWithQuery('section=unknown') },
    )
    expect(result.current.activeSection).toBe('overview')
  })

  it('обновляет секцию при вызове handleSectionChange', () => {
    const { result } = renderHook(
      () =>
        useSectionChange<Section>({
          defaultSection: 'overview',
          sections: [...sections],
        }),
      { wrapper },
    )
    act(() => {
      result.current.handleSectionChange('settings')
    })
    expect(result.current.activeSection).toBe('settings')
  })

  it('поддерживает кастомный queryKey', () => {
    const { result } = renderHook(
      () =>
        useSectionChange<Section>({
          queryKey: 'tab',
          defaultSection: 'overview',
          sections: [...sections],
        }),
      { wrapper: wrapperWithQuery('tab=members') },
    )
    expect(result.current.activeSection).toBe('members')
  })

  it('возвращает defaultSection когда queryKey не совпадает', () => {
    const { result } = renderHook(
      () =>
        useSectionChange<Section>({
          queryKey: 'tab',
          defaultSection: 'overview',
          sections: [...sections],
        }),
      { wrapper: wrapperWithQuery('section=members') },
    )
    expect(result.current.activeSection).toBe('overview')
  })
})
