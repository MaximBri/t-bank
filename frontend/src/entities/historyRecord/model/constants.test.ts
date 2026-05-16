import { describe, expect, it } from 'vitest'

import { HistoryRecordType } from './type'
import { HistoryRecordTypeTranslation } from './constants'

describe('HistoryRecordTypeTranslation', () => {
  it('содержит все типы записей истории', () => {
    expect(HistoryRecordTypeTranslation).toHaveProperty(HistoryRecordType.EventCreated)
    expect(HistoryRecordTypeTranslation).toHaveProperty(HistoryRecordType.EventCompleted)
    expect(HistoryRecordTypeTranslation).toHaveProperty(HistoryRecordType.InvitationCreated)
    expect(HistoryRecordTypeTranslation).toHaveProperty(HistoryRecordType.UserJoined)
    expect(HistoryRecordTypeTranslation).toHaveProperty(HistoryRecordType.UserLeft)
    expect(HistoryRecordTypeTranslation).toHaveProperty(HistoryRecordType.UserRemoved)
    expect(HistoryRecordTypeTranslation).toHaveProperty(HistoryRecordType.ExpenseCreated)
    expect(HistoryRecordTypeTranslation).toHaveProperty(HistoryRecordType.ExpenseUpdated)
    expect(HistoryRecordTypeTranslation).toHaveProperty(HistoryRecordType.ExpenseDeleted)
  })

  it('каждый тип имеет непустую строку перевода', () => {
    Object.entries(HistoryRecordTypeTranslation).forEach(([type, translation]) => {
      expect(typeof translation).toBe('string')
      expect(translation.length).toBeGreaterThan(0)
      expect(translation.trim()).not.toBe('')
    })
  })

  it('правильный перевод для EventCreated', () => {
    expect(HistoryRecordTypeTranslation[HistoryRecordType.EventCreated]).toBe('Создание события')
  })

  it('правильный перевод для EventCompleted', () => {
    expect(HistoryRecordTypeTranslation[HistoryRecordType.EventCompleted]).toBe('Завершение события')
  })

  it('правильный перевод для InvitationCreated', () => {
    expect(HistoryRecordTypeTranslation[HistoryRecordType.InvitationCreated]).toBe(
      'Приглашение пользователя',
    )
  })

  it('правильный перевод для UserJoined', () => {
    expect(HistoryRecordTypeTranslation[HistoryRecordType.UserJoined]).toBe(
      'Пользователь присоединился',
    )
  })

  it('правильный перевод для UserLeft', () => {
    expect(HistoryRecordTypeTranslation[HistoryRecordType.UserLeft]).toBe('Выход пользователя')
  })

  it('правильный перевод для UserRemoved', () => {
    expect(HistoryRecordTypeTranslation[HistoryRecordType.UserRemoved]).toBe('Удаление пользователя')
  })

  it('правильный перевод для ExpenseCreated', () => {
    expect(HistoryRecordTypeTranslation[HistoryRecordType.ExpenseCreated]).toBe('Создание расхода')
  })

  it('правильный перевод для ExpenseUpdated', () => {
    expect(HistoryRecordTypeTranslation[HistoryRecordType.ExpenseUpdated]).toBe('Обновление расхода')
  })

  it('правильный перевод для ExpenseDeleted', () => {
    expect(HistoryRecordTypeTranslation[HistoryRecordType.ExpenseDeleted]).toBe('Удаление расхода')
  })

  it('имеет ровно 9 типов', () => {
    expect(Object.keys(HistoryRecordTypeTranslation)).toHaveLength(9)
  })

  it('переводы уникальны или могут совпадать (исходя из дизайна)', () => {
    const translations = Object.values(HistoryRecordTypeTranslation)
    // Просто проверяем, что все переводы существуют и не пусты
    translations.forEach((translation) => {
      expect(translation).toBeTruthy()
    })
  })
})
