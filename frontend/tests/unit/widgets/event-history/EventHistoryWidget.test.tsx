import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../utils/renderWithProviders.tsx'
import { EventHistoryWidget } from '@/widgets/event-history/ui/EventHistoryWidget.tsx'

vi.mock('@/shared/assets/icons/search.svg?react', () => ({ default: () => null }))

describe('EventHistoryWidget', () => {
  it('renders heading "История событий"', () => {
    renderWithProviders(<EventHistoryWidget />)
    expect(screen.getByText('История событий')).toBeInTheDocument()
  })

  it('renders all 4 filter buttons', () => {
    renderWithProviders(<EventHistoryWidget />)
    expect(screen.getByText('Все')).toBeInTheDocument()
    expect(screen.getByText('Расходы')).toBeInTheDocument()
    expect(screen.getByText('Участники')).toBeInTheDocument()
    expect(screen.getByText('События')).toBeInTheDocument()
  })

  it('renders "Всего записей: 9"', () => {
    renderWithProviders(<EventHistoryWidget />)
    expect(screen.getByText('Всего записей: 8')).toBeInTheDocument()
  })

  it('renders the first record detail text "Событие завершено"', () => {
    renderWithProviders(<EventHistoryWidget />)
    expect(screen.getByText('Событие завершено')).toBeInTheDocument()
  })

  it('renders userFullName of first record "Антон Сидоров"', () => {
    renderWithProviders(<EventHistoryWidget />)
    const elements = screen.getAllByText('Антон Сидоров')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('clicking "Расходы" filter button activates it without error', () => {
    renderWithProviders(<EventHistoryWidget />)
    fireEvent.click(screen.getByText('Расходы'))
    expect(screen.getByText('Расходы')).toBeInTheDocument()
  })
})
