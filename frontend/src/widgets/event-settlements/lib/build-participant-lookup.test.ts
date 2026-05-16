import { describe, expect, it } from 'vitest'

import { buildParticipantLookup } from './build-participant-lookup'

describe('buildParticipantLookup', () => {
  it('returns empty map for empty array', () => {
    const result = buildParticipantLookup([])
    expect(result.size).toBe(0)
  })

  it('maps participant with firstName+lastName to full name "First Last"', () => {
    const participants = [
      { userId: 'u1', login: 'user1', firstName: 'First', lastName: 'Last' },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.get('u1')?.fullName).toBe('First Last')
  })

  it('falls back to login when firstName and lastName are both null', () => {
    const participants = [
      { userId: 'u2', login: 'mylogin', firstName: null, lastName: null },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.get('u2')?.fullName).toBe('mylogin')
  })

  it('sets correct userId as map key', () => {
    const participants = [
      { userId: 'abc-123', login: 'user', firstName: 'Alice', lastName: null },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.has('abc-123')).toBe(true)
  })

  it('handles multiple participants', () => {
    const participants = [
      { userId: 'u1', login: 'alice', firstName: 'Alice', lastName: 'Smith' },
      { userId: 'u2', login: 'bob', firstName: null, lastName: null },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.size).toBe(2)
    expect(result.get('u1')?.fullName).toBe('Alice Smith')
    expect(result.get('u2')?.fullName).toBe('bob')
  })

  it('handles firstName only (no lastName) → "First"', () => {
    const participants = [
      { userId: 'u3', login: 'carol', firstName: 'Carol', lastName: null },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.get('u3')?.fullName).toBe('Carol')
  })

  it('computes initials correctly for firstName+lastName participant', () => {
    const participants = [
      { userId: 'u4', login: 'user4', firstName: 'Alice', lastName: 'Smith' },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.get('u4')?.initials).toBe('A.S.')
  })

  it('computes initials correctly for login-only participant', () => {
    const participants = [
      { userId: 'u5', login: 'zara', firstName: null, lastName: null },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.get('u5')?.initials).toBe('Z')
  })
})
