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
  Confirmed = 'ACTIVE',
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

export type ListInboxItemResponseDto = {
  expenseId: string
  amountToPay: number
  expenseTitle: string
  expenseStatus: ExpenseStatus
}


export type ListInboxResponseDto = {
  listInbox: ListInboxItemResponseDto[]
}

export type CreateExpenseRequestDto = {
  title: string
  description?: string
  total_amount: number
  image_key?: string
  categories: string[]
  participant_ids: string[]
}

export type ExpenseResponseRawDto = {
  id: string
  description: string
  title: string
  total_amount: number
  payer_id: string
  status: ExpenseResponseStatus
  image_key: string | null
  categories: string[]
  first_ten_participants: string[]
  total_participants_count: number
  created_at: string
}

export type EventExpensesResponseRawDto = {
  expenses: ExpenseResponseRawDto[]
  event_total_sum: number
}

export type ListInboxItemRawDto = {
  expense_id: string
  amount_to_pay: number
  expense_title: string
  expense_status: ExpenseStatus
}

export type ListInboxRawDto = {
  list_inbox: ListInboxItemRawDto[]
}
