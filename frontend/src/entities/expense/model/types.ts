export type ExpenseCategory = string

export type ExpenseCategoryList = ExpenseCategory[]

export enum ExpenseStatus {
  Confirmed = 'confirmed',
  Pending = 'pending',
  Disputed = 'disputed',
}

export type Expense = {
  id: number
  amount: number
  category: ExpenseCategory
  participants: number[]
  title: string
  payerName: string
  checkKey: string
}

type Dispute = {
  reason: string
  timestamp: string
}

export type ExpenseListItem = Omit<
  Expense & {
    approvalStatus: ExpenseStatus
    perPersonalAmount: number
    disputeInfo?: Dispute
    createdAt: string
    splitBetweenCount: number
  },
  'participants'
>

export type CreateExpenseDto = {
  title: string
  description?: string
  totalAmount: number
  imageKey?: string
  categories: string[]
  participantIds: string[]
}

export enum ExpenseResponseStatus {
  Pending = 'PENDING',
  Confirmed = 'CONFIRMED',
  Rejected = 'REJECTED',
}

export type ExpenseResponseDto = {
  id: string
  description: string
  title: string
  totalAmount: number
  payerId: string
  status: ExpenseResponseStatus
  image_key: string | null
  imageUrl: string
  categories: string[]
  firstTenParticipants: string[]
  totalParticipantsCount: number
  createdAt: string
}

export type EventExpensesResponseDto = {
  expenses: ExpenseResponseDto[]
  eventTotalSum: number
}

export type ParticipantInboxItemDto = {
  splitId: string
  expenseId: string
  eventId: string
  description: string
  amountToPay: number
  payerId: string
  reason: string
  createdAt: string
}

export type AuthorInboxItemDto = {
  expenseId: string
  eventId: string
  description: string
  title: string
  status: string
}

export type ParticipantInboxResponseDto = {
  pendingConfirmations: ParticipantInboxItemDto[]
  actionRequired: AuthorInboxItemDto[]
}
