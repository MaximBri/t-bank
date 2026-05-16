import { describe, expect, it } from 'vitest'
import { formatParticipantsCount } from './formatParticipantsCount'

describe('formatParticipantsCount', () => {
  it('1 участник', () => {
    expect(formatParticipantsCount(1)).toBe('1 участник')
  })

  it('2 участника', () => {
    expect(formatParticipantsCount(2)).toBe('2 участника')
  })

  it('3 участника', () => {
    expect(formatParticipantsCount(3)).toBe('3 участника')
  })

  it('4 участника', () => {
    expect(formatParticipantsCount(4)).toBe('4 участника')
  })

  it('5 участников', () => {
    expect(formatParticipantsCount(5)).toBe('5 участников')
  })

  it('0 участников', () => {
    expect(formatParticipantsCount(0)).toBe('0 участников')
  })

  it('11 участников (исключение для 11-14)', () => {
    expect(formatParticipantsCount(11)).toBe('11 участников')
  })

  it('12 участников (исключение для 11-14)', () => {
    expect(formatParticipantsCount(12)).toBe('12 участников')
  })

  it('21 участник', () => {
    expect(formatParticipantsCount(21)).toBe('21 участник')
  })

  it('22 участника', () => {
    expect(formatParticipantsCount(22)).toBe('22 участника')
  })

  it('100 участников', () => {
    expect(formatParticipantsCount(100)).toBe('100 участников')
  })
})
