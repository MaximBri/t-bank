import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { renderWithProviders } from '../../utils/renderWithProviders'
import { InvitationStatus } from '@/entities/invitation'
import { EventParticipantsWidget } from '@/widgets/event-participants/ui/EventParticipantsWidget'
import { ParticipantRowKind, EventParticipantStatus } from '@/widgets/event-participants/model/types'
import { useEventParticipantsRows } from '@/widgets/event-participants/lib/useEventParticipantsRows'
import { useDecideInvitation } from '@/entities/invitation/api/hooks/useDecideInvitation'

vi.mock('@/shared/assets/icons/search.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/check.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/close.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/user-minus.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/user-plus.svg?react', () => ({ default: () => null }))

vi.mock('@/features/InviteParticipantsModal/ui/InviteParticipantsModal.tsx', () => ({
  InviteParticipantsModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="invite-modal">Modal</div> : null,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: vi.fn(() => ({ eventId: 'event-1' })) }
})

vi.mock('@/widgets/event-participants/lib/useEventParticipantsRows', () => ({
  useEventParticipantsRows: vi.fn(),
}))

vi.mock('@/entities/invitation/api/hooks/useDecideInvitation', () => ({
  useDecideInvitation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

const mockUseEventParticipantsRows = vi.mocked(useEventParticipantsRows)
const mockUseDecideInvitation = vi.mocked(useDecideInvitation)

const participantRow = {
  kind: ParticipantRowKind.Participant,
  key: 'participant-user-1',
  userId: 'user-1',
  login: 'ivan',
  firstName: 'Иван',
  lastName: 'Иванов',
  status: EventParticipantStatus.participant,
}

const ownerRow = {
  kind: ParticipantRowKind.Participant,
  key: 'participant-owner-1',
  userId: 'owner-1',
  login: 'owner',
  firstName: 'Владелец',
  lastName: null,
  status: EventParticipantStatus.owner,
}

const pendingRow = {
  kind: ParticipantRowKind.Pending,
  key: 'pending-req-1',
  invitationId: 'req-1',
  login: 'newuser',
}

function setupMocks(overrides: Partial<ReturnType<typeof useEventParticipantsRows>> = {}) {
  mockUseEventParticipantsRows.mockReturnValue({
    participantsCount: 0,
    visibleRows: [],
    ...overrides,
  })
}

beforeEach(() => {
  setupMocks()
  mockUseDecideInvitation.mockReturnValue({ mutate: vi.fn(), isPending: false } as any)
})

describe('EventParticipantsWidget', () => {
  it('renders heading "Участники"', () => {
    renderWithProviders(<EventParticipantsWidget />)
    expect(screen.getByText('Участники')).toBeInTheDocument()
  })

  it('renders filter buttons (Все, Приняли приглашение, Приглашённые)', () => {
    renderWithProviders(<EventParticipantsWidget />)
    expect(screen.getByText('Все')).toBeInTheDocument()
    expect(screen.getByText('Приняли приглашение')).toBeInTheDocument()
    expect(screen.getByText('Приглашённые')).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderWithProviders(<EventParticipantsWidget />)
    expect(screen.getByPlaceholderText('Поиск по участникам')).toBeInTheDocument()
  })

  it('renders "Пригласить участников" button', () => {
    renderWithProviders(<EventParticipantsWidget />)
    expect(screen.getByText('Пригласить участников')).toBeInTheDocument()
  })

  it('shows participant count', () => {
    setupMocks({ participantsCount: 3, visibleRows: [] })
    renderWithProviders(<EventParticipantsWidget />)
    expect(screen.getByText(/Всего участников: 3/)).toBeInTheDocument()
  })

  it('renders participant row with name, login, status label', () => {
    setupMocks({ participantsCount: 1, visibleRows: [participantRow] })
    renderWithProviders(<EventParticipantsWidget />)

    expect(screen.getByText('Иван Иванов')).toBeInTheDocument()
    expect(screen.getAllByText('ivan').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Участник')).toBeInTheDocument()
  })

  it('pending row shows "Принять заявку" and "Отклонить заявку" buttons', () => {
    setupMocks({ participantsCount: 0, visibleRows: [pendingRow] })
    renderWithProviders(<EventParticipantsWidget />)

    expect(screen.getByRole('button', { name: 'Принять заявку' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Отклонить заявку' })).toBeInTheDocument()
  })

  it('clicking "Принять заявку" calls decideInvitation with accepted status', () => {
    const mutate = vi.fn()
    mockUseDecideInvitation.mockReturnValue({ mutate, isPending: false } as any)
    setupMocks({ participantsCount: 0, visibleRows: [pendingRow] })

    renderWithProviders(<EventParticipantsWidget />)

    fireEvent.click(screen.getByRole('button', { name: 'Принять заявку' }))

    expect(mutate).toHaveBeenCalledWith({
      invitationId: 'req-1',
      payload: { status: InvitationStatus.Accepted },
    })
  })

  it('clicking "Отклонить заявку" calls decideInvitation with rejected status', () => {
    const mutate = vi.fn()
    mockUseDecideInvitation.mockReturnValue({ mutate, isPending: false } as any)
    setupMocks({ participantsCount: 0, visibleRows: [pendingRow] })

    renderWithProviders(<EventParticipantsWidget />)

    fireEvent.click(screen.getByRole('button', { name: 'Отклонить заявку' }))

    expect(mutate).toHaveBeenCalledWith({
      invitationId: 'req-1',
      payload: { status: InvitationStatus.Rejected },
    })
  })

  it('owner row does NOT show action buttons', () => {
    setupMocks({ participantsCount: 1, visibleRows: [ownerRow] })
    renderWithProviders(<EventParticipantsWidget />)

    expect(screen.queryByRole('button', { name: 'Принять заявку' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Отклонить заявку' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Исключить участника' })).not.toBeInTheDocument()
  })

  it('non-owner participant row shows "Исключить участника" button', () => {
    setupMocks({ participantsCount: 1, visibleRows: [participantRow] })
    renderWithProviders(<EventParticipantsWidget />)

    expect(screen.getByRole('button', { name: 'Исключить участника' })).toBeInTheDocument()
  })

  it('clicking "Пригласить участников" opens the InviteParticipantsModal', () => {
    renderWithProviders(<EventParticipantsWidget />)

    expect(screen.queryByTestId('invite-modal')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Пригласить участников'))

    expect(screen.getByTestId('invite-modal')).toBeInTheDocument()
  })
})
