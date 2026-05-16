import { describe, it, expect } from 'vitest'
import { notificationItems, notificationDefaults, type NotificationItemId } from './constants'

describe('notificationItems', () => {
  it('содержит 4 элемента уведомлений', () => {
    expect(notificationItems).toHaveLength(4)
  })

  it('содержит ожидаемые идентификаторы', () => {
    const ids = notificationItems.map((item) => item.id)
    expect(ids).toContain('event-start')
    expect(ids).toContain('expense-added')
    expect(ids).toContain('notification-3')
    expect(ids).toContain('notification-4')
  })

  it('каждый элемент имеет id и label', () => {
    notificationItems.forEach((item) => {
      expect(item.id).toBeTruthy()
      expect(item.label).toBeTruthy()
    })
  })
})

describe('notificationDefaults', () => {
  const validIds: NotificationItemId[] = [
    'event-start',
    'expense-added',
    'notification-3',
    'notification-4',
  ]

  it('содержит записи для всех идентификаторов уведомлений', () => {
    validIds.forEach((id) => {
      expect(notificationDefaults[id]).toBeDefined()
    })
  })

  it('каждая запись имеет булевые поля onSite и byEmail', () => {
    validIds.forEach((id) => {
      const settings = notificationDefaults[id]
      expect(typeof settings.onSite).toBe('boolean')
      expect(typeof settings.byEmail).toBe('boolean')
    })
  })

  it('event-start имеет корректные значения по умолчанию', () => {
    expect(notificationDefaults['event-start']).toEqual({ onSite: false, byEmail: true })
  })

  it('expense-added имеет корректные значения по умолчанию', () => {
    expect(notificationDefaults['expense-added']).toEqual({ onSite: false, byEmail: false })
  })

  it('notification-3 имеет корректные значения по умолчанию', () => {
    expect(notificationDefaults['notification-3']).toEqual({ onSite: true, byEmail: true })
  })

  it('notification-4 имеет корректные значения по умолчанию', () => {
    expect(notificationDefaults['notification-4']).toEqual({ onSite: true, byEmail: false })
  })
})
