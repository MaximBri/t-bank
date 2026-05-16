import { describe, expect, it } from 'vitest'

import { buildParticipantLookup } from './build-participant-lookup'

describe('buildParticipantLookup', () => {
  it('возвращает пустую карту для пустого массива', () => {
    const result = buildParticipantLookup([])
    expect(result.size).toBe(0)
  })

  it('отображает участника с firstName+lastName в полное имя "First Last"', () => {
    const participants = [
      { userId: 'u1', login: 'user1', firstName: 'First', lastName: 'Last' },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.get('u1')?.fullName).toBe('First Last')
  })

  it('использует login как запасной вариант когда firstName и lastName оба null', () => {
    const participants = [
      { userId: 'u2', login: 'mylogin', firstName: null, lastName: null },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.get('u2')?.fullName).toBe('mylogin')
  })

  it('устанавливает корректный userId в качестве ключа карты', () => {
    const participants = [
      { userId: 'abc-123', login: 'user', firstName: 'Alice', lastName: null },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.has('abc-123')).toBe(true)
  })

  it('обрабатывает нескольких участников', () => {
    const participants = [
      { userId: 'u1', login: 'alice', firstName: 'Alice', lastName: 'Smith' },
      { userId: 'u2', login: 'bob', firstName: null, lastName: null },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.size).toBe(2)
    expect(result.get('u1')?.fullName).toBe('Alice Smith')
    expect(result.get('u2')?.fullName).toBe('bob')
  })

  it('обрабатывает только firstName (без lastName) → "First"', () => {
    const participants = [
      { userId: 'u3', login: 'carol', firstName: 'Carol', lastName: null },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.get('u3')?.fullName).toBe('Carol')
  })

  it('корректно вычисляет инициалы для участника с firstName+lastName', () => {
    const participants = [
      { userId: 'u4', login: 'user4', firstName: 'Alice', lastName: 'Smith' },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.get('u4')?.initials).toBe('A.S.')
  })

  it('корректно вычисляет инициалы для участника только с login', () => {
    const participants = [
      { userId: 'u5', login: 'zara', firstName: null, lastName: null },
    ]
    const result = buildParticipantLookup(participants)
    expect(result.get('u5')?.initials).toBe('Z')
  })
})
