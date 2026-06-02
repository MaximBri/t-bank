import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useUserStore } from '@/entities/user'
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

vi.mock('@/entities/event/api/hooks/useGetEventPreview', () => ({ useGetEventPreview: vi.fn() }))

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

import { useGetEventPreview } from '@/entities/event/api/hooks/useGetEventPreview'
import { pendingInvite } from '@/shared/lib/pendingInvite'

const mockEvent = {
  eventId: 'event-1',
  title: 'Поездка в горы',
  startDate: '2026-06-01',
  endDate: '2026-06-05',
  participantCount: 5,
  imageUrl: '',
  creatorInfo: {
    firstName: 'Антон',
    secondName: 'Сидоров',
    login: 'anton',
    avatarUrl: '',
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockNavigate.mockReset()
  useUserStore.setState({ user: null, isAuthenticated: false })
  vi.mocked(useGetEventPreview).mockReturnValue({ data: mockEvent, isLoading: false } as any)
})

describe('InvitePage', () => {
  it('отображает заголовок приглашения', () => {
    renderWithProviders(<InvitePage />)
    expect(screen.getByText('Вас пригласили поучаствовать в событии')).toBeInTheDocument()
  })

  it('отображает кнопку "Присоединиться" когда пользователь не аутентифицирован', () => {
    renderWithProviders(<InvitePage />)
    expect(screen.getByRole('button', { name: 'Присоединиться' })).toBeInTheDocument()
  })

  it('отображает кнопку "Зарегистрироваться" когда пользователь не аутентифицирован', () => {
    renderWithProviders(<InvitePage />)
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument()
  })

  it('отображает кнопку "Отклонить приглашение"', () => {
    renderWithProviders(<InvitePage />)
    expect(screen.getByRole('button', { name: 'Отклонить приглашение' })).toBeInTheDocument()
  })

  it('отображает кнопку "Присоединиться" когда аутентифицирован', () => {
    useUserStore.setState({ user: { id: 'user-1' } as any, isAuthenticated: true })
    renderWithProviders(<InvitePage />)
    expect(screen.getByRole('button', { name: 'Присоединиться' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Зарегистрироваться' })).not.toBeInTheDocument()
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

  it('отображает текст о подтверждении организатора', () => {
    renderWithProviders(<InvitePage />)
    expect(screen.getByText(/После подтверждения организатора/)).toBeInTheDocument()
  })

  it('клик на "Отклонить" вызывает pendingInvite.clear и navigate', () => {
    renderWithProviders(<InvitePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Отклонить приглашение' }))
    expect(vi.mocked(pendingInvite.clear)).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalled()
  })
})
