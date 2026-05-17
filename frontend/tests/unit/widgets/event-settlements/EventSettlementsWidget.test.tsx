import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useUserStore } from '@/entities/user'
import { EventSettlementsWidget } from '@/widgets/event-settlements/ui/EventSettlementsWidget'
import { renderWithProviders } from '../../utils/renderWithProviders.tsx'

vi.mock('@/shared/assets/icons/arrow-growth.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/arrow-bold.svg?react', () => ({ default: () => null }))

vi.mock('@/entities/settlement', () => ({
  useGetEventSettlements: vi.fn(),
  usePaySettlement: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

vi.mock('@/entities/event/api/hooks/useGetEventParticipants', () => ({
  useGetEventParticipants: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: vi.fn(() => ({ eventId: 'event-1' })) }
})

import { useGetEventSettlements } from '@/entities/settlement'
import { useGetEventParticipants } from '@/entities/event/api/hooks/useGetEventParticipants'

const mockParticipants = [
  { userId: 'user-1', login: 'alice', firstName: 'Alice', lastName: 'Smith' },
  { userId: 'user-2', login: 'bob', firstName: 'Bob', lastName: null },
]

const mockSettlements = [{ fromUserId: 'user-1', toUserId: 'user-2', amount: 1500 }]

beforeEach(() => {
  useUserStore.setState({ user: { id: 'user-1' }, isAuthenticated: true })
  vi.mocked(useGetEventParticipants).mockReturnValue({
    data: mockParticipants,
    isLoading: false,
  } as any)
})

describe('EventSettlementsWidget', () => {
  it('отображает заголовок "Итоговые взаиморасчёты"', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText('Итоговые взаиморасчёты')).toBeInTheDocument()
  })

  it('отображает "Загружаем расчёты..." когда isLoading=true и settlements=[]', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: [],
      isLoading: true,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText('Загружаем расчёты...')).toBeInTheDocument()
  })

  it('отображает "Никто никому не должен" когда isLoading=false и settlements=[]', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText(/Никто никому не должен/)).toBeInTheDocument()
  })

  it('отображает строку взаиморасчёта с полным именем fromUser "Alice Smith"', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('отображает строку взаиморасчёта с полным именем toUser "Bob"', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('отображает отформатированную сумму (содержит "1" и "500")', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    const amountEl = screen.getByText(/1.?500/)
    expect(amountEl).toBeInTheDocument()
  })

  it('отображает кнопку "Оплатить" когда isMyDebt=true (fromUserId === currentUserId)', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText('Оплатить')).toBeInTheDocument()
  })

  it('НЕ отображает "Оплатить" когда isMyDebt=false (fromUserId !== currentUserId)', () => {
    useUserStore.setState({ user: { id: 'user-3' }, isAuthenticated: true })
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.queryByText('Оплатить')).not.toBeInTheDocument()
  })
})
