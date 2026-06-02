import { beforeEach, describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../utils/renderWithProviders.tsx'
import { EventHistoryWidget } from '@/widgets/event-history/ui/EventHistoryWidget.tsx'

vi.mock('@/shared/assets/icons/search.svg?react', () => ({ default: () => null }))
vi.mock('@/entities/historyRecord/api/hooks/useGetEventHistory.ts', () => ({
  useGetEventHistory: vi.fn(),
}))

import { useGetEventHistory } from '@/entities/historyRecord/api/hooks/useGetEventHistory.ts'

const historyRecords = [
  {
    id: 1,
    actionType: 'EVENT_COMPLETED',
    message: 'Событие завершено',
    userFullName: 'Антон Сидоров',
    createdAt: '2026-06-01T10:00:00',
  },
  {
    id: 2,
    actionType: 'EXPENSE_CREATED',
    message: 'Добавлен расход',
    userFullName: 'Мария Иванова',
    createdAt: '2026-06-01T11:00:00',
  },
  {
    id: 3,
    actionType: 'USER_JOINED',
    message: 'Пользователь присоединился',
    userFullName: 'Петр Петров',
    createdAt: '2026-06-01T12:00:00',
  },
  {
    id: 4,
    actionType: 'PAYMENT_SENT',
    message: 'Перевод отправлен',
    userFullName: 'Антон Сидоров',
    createdAt: '2026-06-01T13:00:00',
  },
  {
    id: 5,
    actionType: 'EVENT_CREATED',
    message: 'Событие создано',
    userFullName: 'Антон Сидоров',
    createdAt: '2026-06-01T09:00:00',
  },
  {
    id: 6,
    actionType: 'EXPENSE_UPDATED',
    message: 'Расход обновлен',
    userFullName: 'Мария Иванова',
    createdAt: '2026-06-01T14:00:00',
  },
  {
    id: 7,
    actionType: 'USER_LEFT',
    message: 'Пользователь вышел',
    userFullName: 'Иван Смирнов',
    createdAt: '2026-06-01T15:00:00',
  },
  {
    id: 8,
    actionType: 'EXPENSE_DELETED',
    message: 'Расход удален',
    userFullName: 'Антон Сидоров',
    createdAt: '2026-06-01T16:00:00',
  },
]

beforeEach(() => {
  vi.mocked(useGetEventHistory).mockReturnValue({
    data: historyRecords,
    isLoading: false,
  } as any)
})

describe('EventHistoryWidget', () => {
  it('отображает заголовок "История событий"', () => {
    renderWithProviders(<EventHistoryWidget />)
    expect(screen.getByText('История событий')).toBeInTheDocument()
  })

  it('отображает все 4 кнопки фильтров', () => {
    renderWithProviders(<EventHistoryWidget />)
    expect(screen.getByText('Все')).toBeInTheDocument()
    expect(screen.getByText('Расходы')).toBeInTheDocument()
    expect(screen.getByText('Участники')).toBeInTheDocument()
    expect(screen.getByText('События')).toBeInTheDocument()
  })

  it('отображает "Всего записей: 8"', () => {
    renderWithProviders(<EventHistoryWidget />)
    expect(screen.getByText('Всего записей: 8')).toBeInTheDocument()
  })

  it('отображает текст первой записи "Событие завершено"', () => {
    renderWithProviders(<EventHistoryWidget />)
    expect(screen.getByText('Событие завершено')).toBeInTheDocument()
  })

  it('отображает полное имя пользователя первой записи "Антон Сидоров"', () => {
    renderWithProviders(<EventHistoryWidget />)
    const elements = screen.getAllByText('Антон Сидоров')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('клик на кнопку фильтра "Расходы" активирует его без ошибок', () => {
    renderWithProviders(<EventHistoryWidget />)
    fireEvent.click(screen.getByText('Расходы'))
    expect(screen.getByText('Расходы')).toBeInTheDocument()
  })
})
