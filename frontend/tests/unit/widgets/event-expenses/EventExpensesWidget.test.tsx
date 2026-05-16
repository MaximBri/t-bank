import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/shared/api/api'
import { useUserStore } from '@/entities/user/model/useUserStore'
import { ExpenseResponseStatus } from '@/entities/expense'
import { EventExpensesWidget } from '@/widgets/event-expenses/ui/EventExpensesWidget'

vi.mock('@/shared/assets/icons/add.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/check.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/close.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/edit.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/trash.svg?react', () => ({ default: () => null }))

vi.mock('@/features/CreateExpenseModal', () => ({
  CreateExpenseModal: () => null,
}))

const mock = new MockAdapter(api)

const EVENT_ID = 'event-42'

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: 0, gcTime: 0 }, mutations: { retry: 0 } },
  })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/events/${EVENT_ID}`]}>
        <Routes>
          <Route path="/events/:eventId" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const mockEvent = {
  id: EVENT_ID,
  title: 'Летний лагерь',
  description: '',
  startDate: '2026-07-01',
  endDate: '2026-07-10',
  countOfParticipants: 3,
  categories: ['Питание', 'Транспорт'],
  status: 'ACTIVE',
  imageUrl: '',
  ownerId: 'user-owner',
}

const mockParticipants = {
  participants: [
    { userId: 'user-1', login: 'alice', firstName: 'Alice', lastName: 'Smith' },
    { userId: 'user-2', login: 'bob', firstName: null, lastName: null },
  ],
}

const mockExpense = {
  id: 'exp-1',
  title: 'Ужин в ресторане',
  description: 'Ресторан у моря',
  totalAmount: 6000,
  payerId: 'user-1',
  status: ExpenseResponseStatus.Pending,
  categories: ['Питание'],
  firstTenParticipants: ['user-1', 'user-2'],
  totalParticipantsCount: 1,
  createdAt: '2026-07-05T18:00:00Z',
}

const mockExpenseConfirmed = {
  ...mockExpense,
  id: 'exp-2',
  title: 'Проезд',
  status: ExpenseResponseStatus.Confirmed,
  categories: [],
}

const mockExpenseRejected = {
  ...mockExpense,
  id: 'exp-3',
  title: 'Разное',
  status: ExpenseResponseStatus.Rejected,
  categories: [],
}

describe('EventExpensesWidget', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: { id: 'user-1', login: 'alice', firstName: 'Alice', lastName: 'Smith', avatarUrl: '' },
      isAuthenticated: true,
      isAuthResolved: true,
      isLoading: false,
    })
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

  it('показывает состояние загрузки до получения данных', () => {
    mock.onGet(`/api/events/${EVENT_ID}/expenses`).reply(() => new Promise(() => {}))
    mock.onGet(`/api/events/${EVENT_ID}`).reply(() => new Promise(() => {}))
    mock.onGet(`/api/events/${EVENT_ID}/participants`).reply(() => new Promise(() => {}))

    render(<EventExpensesWidget />, { wrapper })

    expect(screen.getByText(/загружаем расходы/i)).toBeInTheDocument()
  })

  it('показывает пустое состояние когда нет расходов', async () => {
    mock.onGet(`/api/events/${EVENT_ID}/expenses`).reply(200, { expenses: [], eventTotalSum: 0 })
    mock.onGet(`/api/events/${EVENT_ID}`).reply(200, mockEvent)
    mock.onGet(`/api/events/${EVENT_ID}/participants`).reply(200, mockParticipants)

    render(<EventExpensesWidget />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText(/пока нет расходов/i)).toBeInTheDocument()
    })
  })

  it('отображает список расходов', async () => {
    mock.onGet(`/api/events/${EVENT_ID}/expenses`).reply(200, {
      expenses: [mockExpense],
      eventTotalSum: 6000,
    })
    mock.onGet(`/api/events/${EVENT_ID}`).reply(200, mockEvent)
    mock.onGet(`/api/events/${EVENT_ID}/participants`).reply(200, mockParticipants)

    render(<EventExpensesWidget />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Ужин в ресторане')).toBeInTheDocument()
    })

    expect(screen.getByText(/Alice Smith/i)).toBeInTheDocument()
    expect(screen.getByText('Питание')).toBeInTheDocument()
    expect(screen.getByText(/6\s*000/)).toBeInTheDocument()
  })

  it('показывает счётчик расходов в заголовке', async () => {
    mock.onGet(`/api/events/${EVENT_ID}/expenses`).reply(200, {
      expenses: [mockExpense, mockExpenseConfirmed],
      eventTotalSum: 12000,
    })
    mock.onGet(`/api/events/${EVENT_ID}`).reply(200, mockEvent)
    mock.onGet(`/api/events/${EVENT_ID}/participants`).reply(200, mockParticipants)

    render(<EventExpensesWidget />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Ужин в ресторане')).toBeInTheDocument()
    })

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('показывает статус "На проверке" для PENDING расхода', async () => {
    mock.onGet(`/api/events/${EVENT_ID}/expenses`).reply(200, {
      expenses: [mockExpense],
      eventTotalSum: 6000,
    })
    mock.onGet(`/api/events/${EVENT_ID}`).reply(200, mockEvent)
    mock.onGet(`/api/events/${EVENT_ID}/participants`).reply(200, mockParticipants)

    render(<EventExpensesWidget />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('На проверке')).toBeInTheDocument()
    })
  })

  it('показывает статус "Подтверждён" для CONFIRMED расхода', async () => {
    mock.onGet(`/api/events/${EVENT_ID}/expenses`).reply(200, {
      expenses: [mockExpenseConfirmed],
      eventTotalSum: 6000,
    })
    mock.onGet(`/api/events/${EVENT_ID}`).reply(200, mockEvent)
    mock.onGet(`/api/events/${EVENT_ID}/participants`).reply(200, mockParticipants)

    render(<EventExpensesWidget />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Подтверждён')).toBeInTheDocument()
    })
  })

  it('показывает статус "Отклонён" для REJECTED расхода', async () => {
    mock.onGet(`/api/events/${EVENT_ID}/expenses`).reply(200, {
      expenses: [mockExpenseRejected],
      eventTotalSum: 0,
    })
    mock.onGet(`/api/events/${EVENT_ID}`).reply(200, mockEvent)
    mock.onGet(`/api/events/${EVENT_ID}/participants`).reply(200, mockParticipants)

    render(<EventExpensesWidget />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Отклонён')).toBeInTheDocument()
    })
  })

  it('показывает кнопки редактирования и удаления для плательщика', async () => {
    mock.onGet(`/api/events/${EVENT_ID}/expenses`).reply(200, {
      expenses: [mockExpense],
      eventTotalSum: 6000,
    })
    mock.onGet(`/api/events/${EVENT_ID}`).reply(200, mockEvent)
    mock.onGet(`/api/events/${EVENT_ID}/participants`).reply(200, mockParticipants)

    render(<EventExpensesWidget />, { wrapper })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /редактировать расход/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /удалить расход/i })).toBeInTheDocument()
    })
  })

  it('показывает кнопки подтверждения/отклонения для владельца события', async () => {
    useUserStore.setState({
      user: { id: 'user-owner', login: 'owner', firstName: 'Owner', lastName: null, avatarUrl: '' },
      isAuthenticated: true,
      isAuthResolved: true,
      isLoading: false,
    })

    const pendingExpenseByOther = { ...mockExpense, payerId: 'user-2' }

    mock.onGet(`/api/events/${EVENT_ID}/expenses`).reply(200, {
      expenses: [pendingExpenseByOther],
      eventTotalSum: 6000,
    })
    mock.onGet(`/api/events/${EVENT_ID}`).reply(200, mockEvent)
    mock.onGet(`/api/events/${EVENT_ID}/participants`).reply(200, mockParticipants)

    render(<EventExpensesWidget />, { wrapper })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /подтвердить расход/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /отклонить расход/i })).toBeInTheDocument()
    })
  })
})
