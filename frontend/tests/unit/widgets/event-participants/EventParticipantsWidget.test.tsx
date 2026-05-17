import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { renderWithProviders } from '../../utils/renderWithProviders'
import { InvitationStatus } from '@/entities/invitation'
import { EventParticipantsWidget } from '@/widgets/event-participants/ui/EventParticipantsWidget'
import type { ParticipantRow } from '@/widgets/event-participants/model/types'
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

vi.mock('@/entities/event/api/hooks/useGetEvent.ts', () => ({
  useGetEvent: vi.fn(() => ({ data: { ownerId: 'current-user' } })),
}))

vi.mock('@/entities/user', async () => {
  const actual = await vi.importActual('@/entities/user')
  return {
    ...actual,
    useUserStore: (selector: (state: { user: { id: string } }) => unknown) =>
      selector({ user: { id: 'current-user' } }),
  }
})

const mockUseEventParticipantsRows = vi.mocked(useEventParticipantsRows)
const mockUseDecideInvitation = vi.mocked(useDecideInvitation)

const participantRow: ParticipantRow = {
  kind: ParticipantRowKind.Participant,
  key: 'participant-user-1',
  userId: 'user-1',
  login: 'ivan',
  firstName: 'Иван',
  lastName: 'Иванов',
  status: EventParticipantStatus.participant,
}

const ownerRow: ParticipantRow = {
  kind: ParticipantRowKind.Participant,
  key: 'participant-owner-1',
  userId: 'owner-1',
  login: 'owner',
  firstName: 'Владелец',
  lastName: null,
  status: EventParticipantStatus.owner,
}

const pendingRow: ParticipantRow = {
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
  it('отображает заголовок "Участники"', () => {
    renderWithProviders(<EventParticipantsWidget />)
    expect(screen.getByText('Участники')).toBeInTheDocument()
  })

  it('отображает кнопки фильтров (Все, Приняли приглашение, Приглашённые)', () => {
    renderWithProviders(<EventParticipantsWidget />)
    expect(screen.getByText('Все')).toBeInTheDocument()
    expect(screen.getByText('Приняли приглашение')).toBeInTheDocument()
    expect(screen.getByText('Приглашённые')).toBeInTheDocument()
  })

  it('отображает поле поиска', () => {
    renderWithProviders(<EventParticipantsWidget />)
    expect(screen.getByPlaceholderText('Поиск по участникам')).toBeInTheDocument()
  })

  it('отображает кнопку "Пригласить участников"', () => {
    renderWithProviders(<EventParticipantsWidget />)
    expect(screen.getByText('Пригласить участников')).toBeInTheDocument()
  })

  it('отображает количество участников', () => {
    setupMocks({ participantsCount: 3, visibleRows: [] })
    renderWithProviders(<EventParticipantsWidget />)
    expect(screen.getByText(/Всего участников: 3/)).toBeInTheDocument()
  })

  it('отображает строку участника с именем, логином и меткой статуса', () => {
    setupMocks({ participantsCount: 1, visibleRows: [participantRow] })
    renderWithProviders(<EventParticipantsWidget />)

    expect(screen.getByText('Иван Иванов')).toBeInTheDocument()
    expect(screen.getAllByText('ivan').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Участник')).toBeInTheDocument()
  })

  it('pending строка отображает кнопки "Принять заявку" и "Отклонить заявку"', () => {
    setupMocks({ participantsCount: 0, visibleRows: [pendingRow] })
    renderWithProviders(<EventParticipantsWidget />)

    expect(screen.getByRole('button', { name: 'Принять заявку' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Отклонить заявку' })).toBeInTheDocument()
  })

  it('клик на "Принять заявку" вызывает decideInvitation со статусом accepted', () => {
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

  it('клик на "Отклонить заявку" вызывает decideInvitation со статусом rejected', () => {
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

  it('строка владельца НЕ отображает кнопки действий', () => {
    setupMocks({ participantsCount: 1, visibleRows: [ownerRow] })
    renderWithProviders(<EventParticipantsWidget />)

    expect(screen.queryByRole('button', { name: 'Принять заявку' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Отклонить заявку' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Исключить участника' })).not.toBeInTheDocument()
  })

  it('строка участника-не-владельца отображает кнопку "Исключить участника"', () => {
    setupMocks({ participantsCount: 1, visibleRows: [participantRow] })
    renderWithProviders(<EventParticipantsWidget />)

    expect(screen.getByRole('button', { name: 'Исключить участника' })).toBeInTheDocument()
  })

  it('клик на "Пригласить участников" открывает InviteParticipantsModal', () => {
    renderWithProviders(<EventParticipantsWidget />)

    expect(screen.queryByTestId('invite-modal')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Пригласить участников'))

    expect(screen.getByTestId('invite-modal')).toBeInTheDocument()
  })
})
