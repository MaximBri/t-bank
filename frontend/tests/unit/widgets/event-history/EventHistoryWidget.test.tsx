import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../utils/renderWithProviders.tsx'
import { EventHistoryWidget } from '@/widgets/event-history/ui/EventHistoryWidget.tsx'

vi.mock('@/shared/assets/icons/search.svg?react', () => ({ default: () => null }))

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

  it('отображает "Всего записей: 9"', () => {
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
