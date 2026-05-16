import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useUserStore } from '@/entities/user'
import { InvitationStatus } from '@/entities/invitation'
import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent'
import { useGetEventParticipants } from '@/entities/event/api/hooks/useGetEventParticipants'
import { useGetInvitationsInbox } from '@/entities/invitation/api/hooks/useGetInvitationsInbox'

import { useEventParticipantsRows } from './useEventParticipantsRows'
import {
  EventParticipantStatus,
  ParticipantRowKind,
  ParticipantsFilter,
} from '../model/types'

vi.mock('@/entities/event/api/hooks/useGetEvent', () => ({
  useGetEvent: vi.fn(),
}))

vi.mock('@/entities/event/api/hooks/useGetEventParticipants', () => ({
  useGetEventParticipants: vi.fn(),
}))

vi.mock('@/entities/invitation/api/hooks/useGetInvitationsInbox', () => ({
  useGetInvitationsInbox: vi.fn(),
}))

const mockUseGetEvent = vi.mocked(useGetEvent)
const mockUseGetEventParticipants = vi.mocked(useGetEventParticipants)
const mockUseGetInvitationsInbox = vi.mocked(useGetInvitationsInbox)

const EVENT_ID = 'event-1'
const OWNER_ID = 'owner-1'

const mockEvent = {
  id: EVENT_ID,
  title: 'Летний поход',
  ownerId: OWNER_ID,
}

const participantOwner = {
  userId: OWNER_ID,
  login: 'owner',
  firstName: 'Владелец',
  lastName: null,
}

const participantUser = {
  userId: 'user-1',
  login: 'ivan',
  firstName: 'Иван',
  lastName: 'Иванов',
}

const pendingInvitation = {
  id: 'req-1',
  title: 'Летний поход',
  login: 'newuser',
  status: InvitationStatus.PendingApproval,
  createdAt: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  useUserStore.setState({ user: null, isAuthenticated: false })

  mockUseGetEvent.mockReturnValue({ data: mockEvent } as any)
  mockUseGetEventParticipants.mockReturnValue({ data: [] } as any)
  mockUseGetInvitationsInbox.mockReturnValue({ data: [] } as any)
})

describe('useEventParticipantsRows', () => {
  it('returns empty rows when no participants and no inbox', () => {
    const { result } = renderHook(() =>
      useEventParticipantsRows({
        eventId: EVENT_ID,
        filter: ParticipantsFilter.All,
        searchQuery: '',
      }),
    )

    expect(result.current.visibleRows).toHaveLength(0)
    expect(result.current.participantsCount).toBe(0)
  })

  it('returns participant rows with correct status (owner vs participant)', () => {
    mockUseGetEventParticipants.mockReturnValue({
      data: [participantOwner, participantUser],
    } as any)

    const { result } = renderHook(() =>
      useEventParticipantsRows({
        eventId: EVENT_ID,
        filter: ParticipantsFilter.All,
        searchQuery: '',
      }),
    )

    const rows = result.current.visibleRows
    expect(rows).toHaveLength(2)

    const ownerRow = rows.find((r) => r.kind === ParticipantRowKind.Participant && r.userId === OWNER_ID)
    expect(ownerRow).toBeDefined()
    expect((ownerRow as any).status).toBe(EventParticipantStatus.owner)

    const userRow = rows.find((r) => r.kind === ParticipantRowKind.Participant && r.userId === 'user-1')
    expect(userRow).toBeDefined()
    expect((userRow as any).status).toBe(EventParticipantStatus.participant)
  })

  it('filter=Accepted hides pending rows', () => {
    useUserStore.setState({
      user: { id: OWNER_ID, login: 'owner', firstName: 'Владелец', lastName: null, avatarUrl: '' },
      isAuthenticated: true,
    })
    mockUseGetEventParticipants.mockReturnValue({ data: [participantUser] } as any)
    mockUseGetInvitationsInbox.mockReturnValue({ data: [pendingInvitation] } as any)

    const { result } = renderHook(() =>
      useEventParticipantsRows({
        eventId: EVENT_ID,
        filter: ParticipantsFilter.Accepted,
        searchQuery: '',
      }),
    )

    const rows = result.current.visibleRows
    expect(rows.every((r) => r.kind === ParticipantRowKind.Participant)).toBe(true)
    expect(rows.find((r) => r.kind === ParticipantRowKind.Pending)).toBeUndefined()
  })

  it('filter=Invited hides participant rows', () => {
    useUserStore.setState({
      user: { id: OWNER_ID, login: 'owner', firstName: 'Владелец', lastName: null, avatarUrl: '' },
      isAuthenticated: true,
    })
    mockUseGetEventParticipants.mockReturnValue({ data: [participantUser] } as any)
    mockUseGetInvitationsInbox.mockReturnValue({ data: [pendingInvitation] } as any)

    const { result } = renderHook(() =>
      useEventParticipantsRows({
        eventId: EVENT_ID,
        filter: ParticipantsFilter.Invited,
        searchQuery: '',
      }),
    )

    const rows = result.current.visibleRows
    expect(rows.every((r) => r.kind === ParticipantRowKind.Pending)).toBe(true)
    expect(rows.find((r) => r.kind === ParticipantRowKind.Participant)).toBeUndefined()
  })

  it('searchQuery filters by login', () => {
    mockUseGetEventParticipants.mockReturnValue({
      data: [participantUser, participantOwner],
    } as any)

    const { result } = renderHook(() =>
      useEventParticipantsRows({
        eventId: EVENT_ID,
        filter: ParticipantsFilter.All,
        searchQuery: 'ivan',
      }),
    )

    const rows = result.current.visibleRows
    expect(rows).toHaveLength(1)
    expect((rows[0] as any).login).toBe('ivan')
  })

  it('owner sees pending inbox requests when currentUser.id === ownerId', () => {
    useUserStore.setState({
      user: { id: OWNER_ID, login: 'owner', firstName: 'Владелец', lastName: null, avatarUrl: '' },
      isAuthenticated: true,
    })
    mockUseGetInvitationsInbox.mockReturnValue({ data: [pendingInvitation] } as any)

    const { result } = renderHook(() =>
      useEventParticipantsRows({
        eventId: EVENT_ID,
        filter: ParticipantsFilter.All,
        searchQuery: '',
      }),
    )

    const pending = result.current.visibleRows.filter((r) => r.kind === ParticipantRowKind.Pending)
    expect(pending).toHaveLength(1)
    expect((pending[0] as any).login).toBe('newuser')
  })

  it('non-owner does not see pending inbox requests', () => {
    useUserStore.setState({
      user: { id: 'user-1', login: 'ivan', firstName: 'Иван', lastName: 'Иванов', avatarUrl: '' },
      isAuthenticated: true,
    })
    mockUseGetInvitationsInbox.mockReturnValue({ data: [pendingInvitation] } as any)

    const { result } = renderHook(() =>
      useEventParticipantsRows({
        eventId: EVENT_ID,
        filter: ParticipantsFilter.All,
        searchQuery: '',
      }),
    )

    const pending = result.current.visibleRows.filter((r) => r.kind === ParticipantRowKind.Pending)
    expect(pending).toHaveLength(0)
  })

  it('participantsCount equals participants array length', () => {
    mockUseGetEventParticipants.mockReturnValue({
      data: [participantUser, participantOwner],
    } as any)

    const { result } = renderHook(() =>
      useEventParticipantsRows({
        eventId: EVENT_ID,
        filter: ParticipantsFilter.All,
        searchQuery: '',
      }),
    )

    expect(result.current.participantsCount).toBe(2)
  })
})
