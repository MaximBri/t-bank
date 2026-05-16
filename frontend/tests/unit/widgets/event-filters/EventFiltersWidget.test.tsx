import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../utils/renderWithProviders.tsx'
import { EventFiltersWidget } from '@/widgets/event-filters/ui/EventFiltersWidget.tsx'
import { useEventFiltersStore } from '@/widgets/event-filters/model/useEventFiltersStore.ts'

vi.mock('@/shared/assets/icons/search.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/close.svg?react', () => ({ default: () => null }))
vi.mock('@/widgets/event-filters/model/useEventFiltersStore', () => ({
  useEventFiltersStore: vi.fn(),
}))

const mockStore = {
  search: '',
  status: null,
  startDate: '',
  endDate: '',
  minParticipants: '',
  maxParticipants: '',
  setSearch: vi.fn(),
  setStatus: vi.fn(),
  setStartDate: vi.fn(),
  setEndDate: vi.fn(),
  setMinParticipants: vi.fn(),
  setMaxParticipants: vi.fn(),
  reset: vi.fn(),
}

beforeEach(() => {
  vi.mocked(useEventFiltersStore).mockReturnValue(mockStore as any)
  vi.clearAllMocks()
})

describe('EventFiltersWidget', () => {
  it('renders "Фильтры и поиск" heading', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(screen.getByText('Фильтры и поиск')).toBeInTheDocument()
  })

  it('renders search input with name="search"', () => {
    renderWithProviders(<EventFiltersWidget />)
    const input = document.querySelector('input[name="search"]')
    expect(input).toBeInTheDocument()
  })

  it('renders "Статус" section heading', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(screen.getByText('Статус')).toBeInTheDocument()
  })

  it('renders status filter buttons (Все, Активно, Запланировано, Завершено)', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(screen.getByText('Все')).toBeInTheDocument()
    expect(screen.getByText('Активно')).toBeInTheDocument()
    expect(screen.getByText('Запланировано')).toBeInTheDocument()
    expect(screen.getByText('Завершено')).toBeInTheDocument()
  })

  it('renders date inputs (name="start-date" and name="end-date")', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(document.querySelector('input[name="start-date"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="end-date"]')).toBeInTheDocument()
  })

  it('renders participant count inputs (name="min-count" and name="max-count")', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(document.querySelector('input[name="min-count"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="max-count"]')).toBeInTheDocument()
  })

  it('renders reset button with text "Сбросить"', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(screen.getByText('Сбросить')).toBeInTheDocument()
  })

  it('typing in search input calls setSearch', () => {
    renderWithProviders(<EventFiltersWidget />)
    const input = document.querySelector('input[name="search"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test' } })
    expect(mockStore.setSearch).toHaveBeenCalledWith('test')
  })

  it('clicking reset button calls reset', () => {
    renderWithProviders(<EventFiltersWidget />)
    const resetButton = screen.getByText('Сбросить')
    fireEvent.click(resetButton)
    expect(mockStore.reset).toHaveBeenCalled()
  })

  it('clicking onClose button calls the onClose prop', () => {
    const onClose = vi.fn()
    renderWithProviders(<EventFiltersWidget onClose={onClose} />)
    const closeButton = screen.getByRole('button', { name: 'close-filters-modal' })
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })
})
