import { describe, expect, it } from 'vitest'

import { EventStatus } from './types'
import { eventStatusMap } from './constants'

describe('eventStatusMap', () => {
  it('содержит все статусы события', () => {
    expect(eventStatusMap).toHaveProperty(EventStatus.Active)
    expect(eventStatusMap).toHaveProperty(EventStatus.Planned)
    expect(eventStatusMap).toHaveProperty(EventStatus.Completed)
  })

  it('каждый статус имеет background и label', () => {
    Object.entries(eventStatusMap).forEach(([, config]) => {
      expect(config).toHaveProperty('background')
      expect(config).toHaveProperty('label')
      expect(typeof config.background).toBe('string')
      expect(typeof config.label).toBe('string')
      expect(config.background).not.toBe('')
      expect(config.label).not.toBe('')
    })
  })

  it('активное событие имеет правильный фон и метку', () => {
    expect(eventStatusMap[EventStatus.Active]).toEqual({
      background: 'bg-yellow',
      label: 'Активно',
    })
  })

  it('запланированное событие имеет правильный фон и метку', () => {
    expect(eventStatusMap[EventStatus.Planned]).toEqual({
      background: 'bg-green',
      label: 'Запланировано',
    })
  })

  it('завершенное событие имеет правильный фон и метку', () => {
    expect(eventStatusMap[EventStatus.Completed]).toEqual({
      background: 'bg-primary',
      label: 'Завершено',
    })
  })

  it('имеет ровно 3 статуса', () => {
    expect(Object.keys(eventStatusMap)).toHaveLength(3)
  })
})
