import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { pendingInvite } from '@/shared/lib/pendingInvite'

describe('pendingInvite', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  describe('set', () => {
    it('сохраняет токен в sessionStorage', () => {
      pendingInvite.set('test-token')
      expect(sessionStorage.getItem('pending_invite_token')).toBe('test-token')
    })

    it('перезаписывает существующий токен', () => {
      pendingInvite.set('first-token')
      pendingInvite.set('second-token')
      expect(sessionStorage.getItem('pending_invite_token')).toBe('second-token')
    })
  })

  describe('get', () => {
    it('возвращает сохранённый токен', () => {
      pendingInvite.set('my-token')
      expect(pendingInvite.get()).toBe('my-token')
    })

    it('возвращает undefined когда токен не установлен', () => {
      expect(pendingInvite.get()).toBeUndefined()
    })

    it('возвращает undefined после очистки', () => {
      pendingInvite.set('some-token')
      pendingInvite.clear()
      expect(pendingInvite.get()).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('удаляет токен из sessionStorage', () => {
      pendingInvite.set('token-to-remove')
      pendingInvite.clear()
      expect(sessionStorage.getItem('pending_invite_token')).toBeNull()
    })

    it('не выбрасывает ошибку при вызове без предварительного set', () => {
      expect(() => pendingInvite.clear()).not.toThrow()
    })

    it('после clear get возвращает undefined', () => {
      pendingInvite.set('abc')
      pendingInvite.clear()
      expect(pendingInvite.get()).toBeUndefined()
    })
  })

  describe('совместная работа методов', () => {
    it('set -> get -> clear -> get', () => {
      pendingInvite.set('invite-123')
      expect(pendingInvite.get()).toBe('invite-123')
      pendingInvite.clear()
      expect(pendingInvite.get()).toBeUndefined()
    })

    it('сохраняет токен с uuid', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      pendingInvite.set(uuid)
      expect(pendingInvite.get()).toBe(uuid)
    })
  })
})
