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
  it('отображает заголовок "Фильтры и поиск"', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(screen.getByText('Фильтры и поиск')).toBeInTheDocument()
  })

  it('отображает поле поиска с name="search"', () => {
    renderWithProviders(<EventFiltersWidget />)
    const input = document.querySelector('input[name="search"]')
    expect(input).toBeInTheDocument()
  })

  it('отображает заголовок секции "Статус"', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(screen.getByText('Статус')).toBeInTheDocument()
  })

  it('отображает кнопки фильтра статуса (Все, Активно, Запланировано, Завершено)', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(screen.getByText('Все')).toBeInTheDocument()
    expect(screen.getByText('Активно')).toBeInTheDocument()
    expect(screen.getByText('Запланировано')).toBeInTheDocument()
    expect(screen.getByText('Завершено')).toBeInTheDocument()
  })

  it('отображает поля дат (name="start-date" и name="end-date")', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(document.querySelector('input[name="start-date"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="end-date"]')).toBeInTheDocument()
  })

  it('отображает поля количества участников (name="min-count" и name="max-count")', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(document.querySelector('input[name="min-count"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="max-count"]')).toBeInTheDocument()
  })

  it('отображает кнопку сброса с текстом "Сбросить"', () => {
    renderWithProviders(<EventFiltersWidget />)
    expect(screen.getByText('Сбросить')).toBeInTheDocument()
  })

  it('ввод текста в поле поиска вызывает setSearch', () => {
    renderWithProviders(<EventFiltersWidget />)
    const input = document.querySelector('input[name="search"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test' } })
    expect(mockStore.setSearch).toHaveBeenCalledWith('test')
  })

  it('клик на кнопку сброса вызывает reset', () => {
    renderWithProviders(<EventFiltersWidget />)
    const resetButton = screen.getByText('Сбросить')
    fireEvent.click(resetButton)
    expect(mockStore.reset).toHaveBeenCalled()
  })

  it('клик на кнопку закрытия вызывает проп onClose', () => {
    const onClose = vi.fn()
    renderWithProviders(<EventFiltersWidget onClose={onClose} />)
    const closeButton = screen.getByRole('button', { name: 'close-filters-modal' })
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })
})
