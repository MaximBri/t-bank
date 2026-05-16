import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useUserStore } from '@/entities/user'
import { EventStatus } from '@/entities/event/model/types'
import { InvitePage } from '@/pages/invite/ui/InvitePage'
import { renderWithProviders } from '../utils/renderWithProviders.tsx'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
}))

vi.mock('@/shared/assets/icons/calendar.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/close.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/image-filled.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/users.svg?react', () => ({ default: () => null }))

vi.mock('@/entities/event/api/hooks/useGetEvent', () => ({ useGetEvent: vi.fn() }))

vi.mock('@/shared/lib/pendingInvite', () => ({
  pendingInvite: { set: vi.fn(), clear: vi.fn() },
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(() => ({ eventId: 'event-1', token: 'invite-token-123' })),
    useNavigate: vi.fn(() => mockNavigate),
  }
})

import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent'
import { pendingInvite } from '@/shared/lib/pendingInvite'

const mockEvent = {
  id: 'event-1',
  title: 'Поездка в горы',
  startDate: '2026-06-01',
  endDate: '2026-06-05',
  countOfParticipants: 5,
  categories: [],
  status: EventStatus.Active,
  imageUrl: '',
  ownerId: 'owner-1',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockNavigate.mockReset()
  useUserStore.setState({ user: null, isAuthenticated: false })
  vi.mocked(useGetEvent).mockReturnValue({ data: mockEvent, isLoading: false } as any)
})

describe('InvitePage', () => {
  it('отображает заголовок "Приглашение в событие"', () => {
    renderWithProviders(<InvitePage />)
    expect(screen.getByText('Приглашение в событие')).toBeInTheDocument()
  })

  it('отображает кнопку "Войти" когда пользователь не аутентифицирован', () => {
    renderWithProviders(<InvitePage />)
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })

  it('отображает кнопку "Зарегистрироваться" когда пользователь не аутентифицирован', () => {
    renderWithProviders(<InvitePage />)
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument()
  })

  it('отображает кнопку "Отклонить"', () => {
    renderWithProviders(<InvitePage />)
    expect(screen.getByRole('button', { name: 'Отклонить' })).toBeInTheDocument()
  })

  it('отображает кнопку "Перезайти и присоединиться" когда аутентифицирован (без "Войти")', () => {
    useUserStore.setState({ user: { id: 'user-1' } as any, isAuthenticated: true })
    renderWithProviders(<InvitePage />)
    expect(screen.getByRole('button', { name: 'Перезайти и присоединиться' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Войти' })).not.toBeInTheDocument()
  })

  it('не отображает "Зарегистрироваться" когда пользователь аутентифицирован', () => {
    useUserStore.setState({ user: { id: 'user-1' } as any, isAuthenticated: true })
    renderWithProviders(<InvitePage />)
    expect(screen.queryByRole('button', { name: 'Зарегистрироваться' })).not.toBeInTheDocument()
  })

  it('отображает заголовок события "Поездка в горы" когда данные события загружены', () => {
    renderWithProviders(<InvitePage />)
    expect(screen.getByText('Поездка в горы')).toBeInTheDocument()
  })

  it('отображает текст для неаутентифицированного пользователя (содержит "Войдите или зарегистрируйтесь")', () => {
    renderWithProviders(<InvitePage />)
    expect(screen.getByText(/Войдите или зарегистрируйтесь/)).toBeInTheDocument()
  })

  it('отображает текст для аутентифицированного пользователя (содержит "нужно перезайти") когда isAuthenticated=true', () => {
    useUserStore.setState({ user: { id: 'user-1' } as any, isAuthenticated: true })
    renderWithProviders(<InvitePage />)
    expect(screen.getByText(/нужно перезайти/)).toBeInTheDocument()
  })

  it('клик на "Отклонить" вызывает pendingInvite.clear и navigate', () => {
    renderWithProviders(<InvitePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Отклонить' }))
    expect(vi.mocked(pendingInvite.clear)).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalled()
  })
})
