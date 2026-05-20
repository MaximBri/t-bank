export enum HistoryRecordType {
  EventCreated = 'EventCreated',
  EventCompleted = 'EventCompleted',
  InvitationCreated = 'InvitationCreated',
  UserJoined = 'UserJoined',
  UserLeft = 'UserLeft',
  UserRemoved = 'UserRemoved',
  ExpenseCreated = 'ExpenseCreated',
  ExpenseUpdated = 'ExpenseUpdated',
  ExpenseDeleted = 'ExpenseDeleted',
  ExpenseActivated = 'ExpenseActivated',
  ExpenseRejected = 'ExpenseRejected',
  SplitConfirmed = 'SplitConfirmed',
  PaymentInitiated = 'PaymentInitiated',
  PaymentConfirmed = 'PaymentConfirmed',
  PaymentSent = 'PaymentSent',
  PaymentFailed = 'PaymentFailed',
  PaymentCompleted = 'PaymentCompleted',
}

export type HistoryRecord = {
  id: number
  type: HistoryRecordType
  detail: string
  userFullName: string
  createdAt: string
}
