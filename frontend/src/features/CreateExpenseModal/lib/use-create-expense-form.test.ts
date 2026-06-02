import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { createElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/shared/api/api'
import { useUserStore } from '@/entities/user/model/useUserStore'
import { useCreateExpenseForm } from './use-create-expense-form'

const mock = new MockAdapter(api)

const EVENT_ID = 'event-form-test'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: 0, gcTime: 0 }, mutations: { retry: 0 } },
  })
  function Wrapper({ children }: PropsWithChildren) {
    return createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        MemoryRouter,
        { initialEntries: [`/events/${EVENT_ID}`] },
        createElement(Routes, null,
          createElement(Route, { path: '/events/:eventId', element: children })
        )
      )
    )
  }
  return Wrapper
}

const mockParticipants = {
  participants: [
    { userId: 'user-1', login: 'alice', firstName: 'Alice', lastName: 'Smith' },
    { userId: 'user-2', login: 'bob', firstName: null, lastName: null },
  ],
}

const mockEvent = {
  id: EVENT_ID,
  title: 'Test Event',
  description: '',
  startDate: '2026-07-01',
  endDate: '2026-07-10',
  countOfParticipants: 2,
  categories: ['Питание', 'Транспорт'],
  status: 'ACTIVE',
  imageUrl: '',
  ownerId: 'user-1',
}

describe('useCreateExpenseForm', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: { id: 'user-1', login: 'alice', firstName: 'Alice', lastName: 'Smith', avatarUrl: '' },
      isAuthenticated: true,
      isAuthResolved: true,
      isLoading: false,
    })

    mock.onGet(`/api/events/${EVENT_ID}/participants`).reply(200, mockParticipants)
    mock.onGet(`/api/events/${EVENT_ID}`).reply(200, mockEvent)
  })

  afterEach(() => {
    mock.reset()
    useUserStore.setState({
      user: null,
      isAuthenticated: false,
      isAuthResolved: false,
      isLoading: false,
    })
  })

  it('возвращает начальное состояние с isEdit=false и isSubmitting=false', () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(
      () => useCreateExpenseForm({ isOpen: true, onSuccess }),
      { wrapper: makeWrapper() },
    )

    expect(result.current.isEdit).toBe(false)
    expect(result.current.isSubmitting).toBe(false)
  })

  it('возвращает isEdit=true когда передан expense', () => {
    const onSuccess = vi.fn()
    const expense = {
      id: 'exp-1',
      title: 'Ужин',
      description: '',
      totalAmount: 1000,
      payerId: 'user-1',
      status: 'PENDING' as const,
      categories: ['Питание'],
      firstTenParticipants: ['user-1'],
      totalParticipantsCount: 1,
      createdAt: '2026-01-01T00:00:00Z',
    }

    const { result } = renderHook(
      () => useCreateExpenseForm({ isOpen: true, expense, onSuccess }),
      { wrapper: makeWrapper() },
    )

    expect(result.current.isEdit).toBe(true)
  })

  it('возвращает список категорий из события', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(
      () => useCreateExpenseForm({ isOpen: true, onSuccess }),
      { wrapper: makeWrapper() },
    )

    await waitFor(() => {
      expect(result.current.categories).toEqual(['Питание', 'Транспорт'])
    })
  })

  it('формирует список участников с меткой (Вы) для текущего пользователя', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(
      () => useCreateExpenseForm({ isOpen: true, onSuccess }),
      { wrapper: makeWrapper() },
    )

    await waitFor(() => {
      expect(result.current.participants.length).toBe(2)
    })

    const self = result.current.participants.find((p) => p.id === 'user-1')
    expect(self).toBeDefined()
    expect(self?.fullName).toContain('(Вы)')
    expect(self?.isLocked).toBe(true)

    const other = result.current.participants.find((p) => p.id === 'user-2')
    expect(other?.fullName).toBe('bob')
    expect(other?.isLocked).toBeFalsy()
  })

  it('возвращает пустой список участников когда нет данных', () => {
    const onSuccess = vi.fn()

    const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 } } })
    function NoParamWrapper({ children }: PropsWithChildren) {
      return createElement(
        QueryClientProvider,
        { client: qc },
        createElement(MemoryRouter, { initialEntries: ['/other'] },
          createElement(Routes, null,
            createElement(Route, { path: '/other', element: children })
          )
        )
      )
    }

    const { result } = renderHook(
      () => useCreateExpenseForm({ isOpen: true, onSuccess }),
      { wrapper: NoParamWrapper },
    )

    expect(result.current.participants).toEqual([])
  })

  it('заполняет форму данными expense при открытии в режиме редактирования', async () => {
    const onSuccess = vi.fn()
    const expense = {
      id: 'exp-edit',
      title: 'Транспорт на юг',
      description: 'Билеты',
      totalAmount: 4500,
      payerId: 'user-1',
      status: 'CONFIRMED' as const,
      categories: ['Транспорт'],
      firstTenParticipants: ['user-1', 'user-2'],
      totalParticipantsCount: 2,
      createdAt: '2026-07-02T10:00:00Z',
    }

    const { result } = renderHook(
      () => useCreateExpenseForm({ isOpen: true, expense, onSuccess }),
      { wrapper: makeWrapper() },
    )

    await waitFor(() => {
      expect(result.current.methods.getValues('title')).toBe('Транспорт на юг')
    })

    expect(result.current.methods.getValues('amount')).toBe(4500)
    expect(result.current.methods.getValues('category')).toBe('Транспорт')
  })

  it('вызывает createExpense при сабмите формы без expense', async () => {
    mock.onPost(`/api/events/${EVENT_ID}/expenses`).reply(201, 'new-expense-id')

    const onSuccess = vi.fn()
    const { result } = renderHook(
      () => useCreateExpenseForm({ isOpen: true, onSuccess }),
      { wrapper: makeWrapper() },
    )

    act(() => {
      result.current.methods.setValue('title', 'Новый расход')
      result.current.methods.setValue('amount', 500)
      result.current.methods.setValue('category', 'Питание')
      result.current.methods.setValue('participants', ['user-1', 'user-2'])
    })

    await act(async () => {
      await result.current.submitForm()
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('resetForm сбрасывает значения формы к дефолтным', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(
      () => useCreateExpenseForm({ isOpen: true, onSuccess }),
      { wrapper: makeWrapper() },
    )

    act(() => {
      result.current.methods.setValue('title', 'Какой-то заголовок')
    })

    expect(result.current.methods.getValues('title')).toBe('Какой-то заголовок')

    act(() => {
      result.current.resetForm()
    })

    expect(result.current.methods.getValues('title')).toBe('')
  })
})
