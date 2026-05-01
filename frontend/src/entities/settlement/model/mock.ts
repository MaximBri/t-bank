import { Settlement, SettlementStatus } from './types'

export const mockSettlements: Settlement[] = [
  {
    id: 1,
    fromUser: {
      id: 101,
      fullName: 'Анна Смирнова',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      initials: 'А.С.',
    },
    toUser: {
      id: 102,
      fullName: 'Иван Петров',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
      initials: 'И.П.',
    },
    amount: 1250,
    status: SettlementStatus.Pending,
  },
  {
    id: 3,
    fromUser: {
      id: 105,
      fullName: 'Ольга Соколова',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      initials: 'О.С.',
    },
    toUser: {
      id: 106,
      fullName: 'Алексей Морозов',
      avatarUrl: 'https://i.pravatar.cc/150?img=6',
      initials: 'А.М.',
    },
    amount: 2100,
    status: SettlementStatus.WaitingConfirmation,
  },
  {
    id: 4,
    fromUser: {
      id: 107,
      fullName: 'Екатерина Лебедева',
      avatarUrl: 'https://i.pravatar.cc/150?img=7',
      initials: 'Е.Л.',
    },
    toUser: {
      id: 108,
      fullName: 'Сергей Никитин',
      avatarUrl: 'https://i.pravatar.cc/150?img=8',
      initials: 'С.Н.',
    },
    amount: 540,
    status: SettlementStatus.Pending,
  },
]
