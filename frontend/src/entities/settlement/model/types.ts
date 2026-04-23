export enum SettlementStatus {
    Pending = "pending",
    Completed = "completed",
    WaitingConfirmation = "waiting_confirmation"
}


// Временный тип юзера для вёртски виджета взаиморасчётов
type SettlementUser = {
    id: number
    fullName: string
    avatarUrl: string
    initials: string
}

export type Settlement = {
    id: number
    fromUser: SettlementUser
    toUser: SettlementUser
    amount: number
    status: SettlementStatus
}