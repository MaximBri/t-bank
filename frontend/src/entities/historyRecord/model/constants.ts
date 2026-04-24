import { HistoryRecordType } from '@/entities/historyRecord/model/type.ts'

export const HistoryRecordTypeTranslation: Record<HistoryRecordType, string> = {
  [HistoryRecordType.EventCreated]: 'Создание события',
  [HistoryRecordType.EventCompleted]: 'Завершение события',
  [HistoryRecordType.InvitationCreated]: 'Приглашение пользователя',
  [HistoryRecordType.UserJoined]: 'Пользователь присоединился',
  [HistoryRecordType.UserLeft]: 'Выход пользователя',
  [HistoryRecordType.UserRemoved]: 'Удаление пользователя',
  [HistoryRecordType.ExpenseCreated]: 'Создание расхода',
  [HistoryRecordType.ExpenseUpdated]: 'Обновление расхода',
  [HistoryRecordType.ExpenseDeleted]: 'Удаление расхода',
}
