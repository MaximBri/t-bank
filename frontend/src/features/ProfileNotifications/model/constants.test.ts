import { describe, it, expect } from 'vitest'
import { notificationItems, notificationDefaults, type NotificationItemId } from './constants'

describe('notificationItems', () => {
  it('has 4 notification items', () => {
    expect(notificationItems).toHaveLength(4)
  })

  it('contains expected ids', () => {
    const ids = notificationItems.map((item) => item.id)
    expect(ids).toContain('event-start')
    expect(ids).toContain('expense-added')
    expect(ids).toContain('notification-3')
    expect(ids).toContain('notification-4')
  })

  it('each item has id and label', () => {
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

  it('has entries for all notification ids', () => {
    validIds.forEach((id) => {
      expect(notificationDefaults[id]).toBeDefined()
    })
  })

  it('each entry has onSite and byEmail booleans', () => {
    validIds.forEach((id) => {
      const settings = notificationDefaults[id]
      expect(typeof settings.onSite).toBe('boolean')
      expect(typeof settings.byEmail).toBe('boolean')
    })
  })

  it('event-start has correct defaults', () => {
    expect(notificationDefaults['event-start']).toEqual({ onSite: false, byEmail: true })
  })

  it('expense-added has correct defaults', () => {
    expect(notificationDefaults['expense-added']).toEqual({ onSite: false, byEmail: false })
  })

  it('notification-3 has correct defaults', () => {
    expect(notificationDefaults['notification-3']).toEqual({ onSite: true, byEmail: true })
  })

  it('notification-4 has correct defaults', () => {
    expect(notificationDefaults['notification-4']).toEqual({ onSite: true, byEmail: false })
  })
})
