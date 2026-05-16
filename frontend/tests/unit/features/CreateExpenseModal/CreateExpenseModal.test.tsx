import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { CreateExpenseModal } from '@/features/CreateExpenseModal/ui/CreateExpenseModal'

vi.mock('@/entities/event/api/hooks/useGetEvent', () => ({
  useGetEvent: () => ({
    data: { categories: ['Еда', 'Транспорт'] },
    isLoading: false,
  }),
}))

vi.mock('@/entities/event/api/hooks/useGetEventParticipants', () => ({
  useGetEventParticipants: () => ({
    data: [
      { userId: 'user-1', login: 'testuser', firstName: 'Test', lastName: 'User' },
    ],
    isLoading: false,
  }),
}))

vi.mock('@/entities/user', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/user')>()
  return {
    ...actual,
    useUserStore: (selector: (state: { user: { id: string } }) => unknown) =>
      selector({ user: { id: 'user-1' } }),
  }
})

vi.mock('@/entities/expense', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/expense')>()
  return {
    ...actual,
    useCreateExpense: () => ({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    }),
    useUpdateExpense: () => ({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    }),
  }
})

const mockAxios = new MockAdapter(axios)

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function renderModal(isOpen = true, onClose = vi.fn()) {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/events/event-123/expenses']}>
        <Routes>
          <Route
            path="/events/:eventId/expenses"
            element={<CreateExpenseModal isOpen={isOpen} onClose={onClose} />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CreateExpenseModal', () => {
  beforeEach(() => {
    mockAxios.reset()
    mockAxios.onPost(/\/api\/events\/.*\/expenses/).reply(200, 'expense-id')
  })

  it('рендерится когда isOpen=true', () => {
    renderModal(true)
    expect(screen.getByText('Добавление расхода')).toBeInTheDocument()
  })

  it('не рендерится когда isOpen=false', () => {
    renderModal(false)
    expect(screen.queryByText('Добавление расхода')).not.toBeInTheDocument()
  })

  it('содержит поле заголовка', () => {
    renderModal()
    expect(document.querySelector('input[name="title"]')).toBeInTheDocument()
  })

  it('содержит поле суммы', () => {
    renderModal()
    expect(document.querySelector('input[name="amount"]')).toBeInTheDocument()
  })

  it('содержит кнопку добавления', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /добавить/i })).toBeInTheDocument()
  })

  it('показывает ошибки валидации при пустом сабмите', async () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/поле обязательно/i).length).toBeGreaterThan(0)
    })
  })

  it('вызывает onClose при клике на кнопку закрытия', () => {
    const onClose = vi.fn()
    renderModal(true, onClose)
    fireEvent.click(screen.getByRole('button', { name: /close-create-expense-modal/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('вызывает onClose при нажатии Escape', async () => {
    const onClose = vi.fn()
    renderModal(true, onClose)
    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
