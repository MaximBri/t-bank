import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { renderWithProviders } from '../../utils/renderWithProviders'
import { EventStatus } from '@/entities/event/model/types'
import { eventStatusMap } from '@/entities/event'
import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent'
import { useGetEventParticipants } from '@/entities/event/api/hooks/useGetEventParticipants'
import { useUserStore } from '@/entities/user'
import { getUserInitials } from '@/shared/lib/getUserInitials'
import { EventHeaderWidget } from '@/widgets/event-header/ui/EventHeaderWidget'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
}))

vi.mock('@/entities/event/api/hooks/useGetEvent', () => ({ useGetEvent: vi.fn() }))
vi.mock('@/entities/event/api/hooks/useGetEventParticipants', () => ({
  useGetEventParticipants: vi.fn(),
}))
vi.mock('@/features/CreateEventModal', () => ({ CreateEventModal: () => null }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: vi.fn(() => ({ eventId: 'event-1' })) }
})

vi.mock('@/shared/assets/icons/calendar.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/edit.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/image-filled.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/exit.svg?react', () => ({ default: () => null }))

const mockUseGetEvent = vi.mocked(useGetEvent)
const mockUseGetEventParticipants = vi.mocked(useGetEventParticipants)

const mockEvent = {
  id: 'event-1',
  title: 'Корпоратив',
  startDate: '2026-06-01',
  endDate: '2026-06-05',
  countOfParticipants: 3,
  categories: [],
  status: EventStatus.Active,
  imageUrl: '',
  ownerId: 'owner-1',
}

const mockParticipants = [
  { userId: 'u1', login: 'alice', firstName: 'Alice', lastName: 'Smith' },
  { userId: 'u2', login: 'bob', firstName: 'Bob', lastName: null },
]

beforeEach(() => {
  mockUseGetEvent.mockReturnValue({ data: mockEvent } as any)
  mockUseGetEventParticipants.mockReturnValue({ data: mockParticipants } as any)
  useUserStore.setState({ user: null } as any)
})

describe('EventHeaderWidget', () => {
  it('возвращает null когда событие не определено', () => {
    mockUseGetEvent.mockReturnValue({ data: undefined } as any)
    const { container } = renderWithProviders(
      <EventHeaderWidget onLeaveEventClick={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('отображает заголовок события "Корпоратив"', () => {
    renderWithProviders(<EventHeaderWidget onLeaveEventClick={vi.fn()} />)
    expect(screen.getByText('Корпоратив')).toBeInTheDocument()
  })

  it('отображает метку статуса события из eventStatusMap', () => {
    renderWithProviders(<EventHeaderWidget onLeaveEventClick={vi.fn()} />)
    const statusLabel = eventStatusMap[EventStatus.Active].label
    expect(screen.getByText(statusLabel)).toBeInTheDocument()
  })

  it('отображает кнопку "Редактировать" когда текущий пользователь является владельцем', () => {
    useUserStore.setState({ user: { id: 'owner-1' } } as any)
    renderWithProviders(<EventHeaderWidget onLeaveEventClick={vi.fn()} />)
    expect(screen.getByText('Редактировать')).toBeInTheDocument()
  })

  it('отображает кнопку "Завершить событие" когда текущий пользователь является владельцем', () => {
    useUserStore.setState({ user: { id: 'owner-1' } } as any)
    renderWithProviders(<EventHeaderWidget onLeaveEventClick={vi.fn()} />)
    expect(screen.getByText('Завершить событие')).toBeInTheDocument()
  })

  it('не отображает "Покинуть событие" когда пользователь является владельцем', () => {
    useUserStore.setState({ user: { id: 'owner-1' } } as any)
    renderWithProviders(<EventHeaderWidget onLeaveEventClick={vi.fn()} />)
    expect(screen.queryByText('Покинуть событие')).not.toBeInTheDocument()
  })

  it('не отображает "Покинуть событие" когда пользователь НЕ является владельцем', () => {
    useUserStore.setState({ user: { id: 'other-user' } } as any)
    renderWithProviders(<EventHeaderWidget onLeaveEventClick={vi.fn()} />)
    expect(screen.queryByText('Покинуть событие')).not.toBeInTheDocument()
  })

  it('отображает аватары участников с использованием getUserInitials', () => {
    renderWithProviders(<EventHeaderWidget onLeaveEventClick={vi.fn()} />)
    const initialsAlice = getUserInitials('Alice', 'Smith', 'alice')
    const initialsBob = getUserInitials('Bob', null, 'bob')
    expect(screen.getByText(initialsAlice)).toBeInTheDocument()
    expect(screen.getByText(initialsBob)).toBeInTheDocument()
  })

  it('отображает текст с количеством участников', () => {
    renderWithProviders(<EventHeaderWidget onLeaveEventClick={vi.fn()} />)
    expect(screen.getByText('3 участника')).toBeInTheDocument()
  })
})
