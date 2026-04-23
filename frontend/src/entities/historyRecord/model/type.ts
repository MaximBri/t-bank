export enum HistoryRecordType {
    EventCreated = "EventCreated",
    EventCompleted = "EventCompleted",
    InvitationCreated = "InvitationCreated",
    UserJoined = "UserJoined",
    UserLeft = "UserLeft",
    UserRemoved = "UserRemoved",
    ExpenseCreated = "ExpenseCreated",
    ExpenseUpdated = "ExpenseUpdated",
    ExpenseDeleted = "ExpenseDeleted",
}

export type HistoryRecord = {
    id: number
    type: HistoryRecordType
    detail: string
    userFullName: string
    createdAt: string
}