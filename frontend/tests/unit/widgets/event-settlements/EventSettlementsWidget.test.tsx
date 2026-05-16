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
  it('renders "Итоговые взаиморасчёты" heading', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText('Итоговые взаиморасчёты')).toBeInTheDocument()
  })

  it('shows "Загружаем расчёты..." when isLoading=true and settlements=[]', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: [],
      isLoading: true,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText('Загружаем расчёты...')).toBeInTheDocument()
  })

  it('shows "Никто никому не должен" when isLoading=false and settlements=[]', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText(/Никто никому не должен/)).toBeInTheDocument()
  })

  it('renders settlement row with fromUser fullName "Alice Smith"', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('renders settlement row with toUser fullName "Bob"', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders formatted amount (contains "1" and "500")', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    const amountEl = screen.getByText(/1.?500/)
    expect(amountEl).toBeInTheDocument()
  })

  it('shows "Оплатить" button when isMyDebt=true (fromUserId === currentUserId)', () => {
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.getByText('Оплатить')).toBeInTheDocument()
  })

  it('does NOT show "Оплатить" when isMyDebt=false (fromUserId !== currentUserId)', () => {
    useUserStore.setState({ user: { id: 'user-3' }, isAuthenticated: true })
    vi.mocked(useGetEventSettlements).mockReturnValue({
      data: mockSettlements,
      isLoading: false,
    } as any)
    renderWithProviders(<EventSettlementsWidget />)
    expect(screen.queryByText('Оплатить')).not.toBeInTheDocument()
  })
})
