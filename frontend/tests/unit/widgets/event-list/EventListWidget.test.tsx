import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { EventStatus } from '@/entities/event/model/types'
import type { EventResponse } from '@/entities/event/model/types'
import { EventListWidget } from '@/widgets/event-list/ui/EventListWidget'

vi.mock('@/shared/assets/icons/calendar.svg?react', () => ({ default: () => null }))
vi.mock('@/shared/assets/icons/users.svg?react', () => ({ default: () => null }))

const mockEvents: EventResponse[] = [
  {
    id: 'event-1',
    title: 'Летний поход',
    description: '',
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    countOfParticipants: 5,
    categories: [],
    status: EventStatus.Active,
    imageUrl: '',
    image_key: null,
    ownerId: 'user-1',
  },
  {
    id: 'event-2',
    title: 'Новый год',
    description: '',
    startDate: '2026-12-31',
    endDate: '2027-01-01',
    countOfParticipants: 10,
    categories: [],
    status: EventStatus.Planned,
    imageUrl: '',
    image_key: null,
    ownerId: 'user-1',
  },
]

function renderWidget(props: Partial<React.ComponentProps<typeof EventListWidget>> = {}) {
  return render(
    <MemoryRouter>
      <EventListWidget items={[]} {...props} />
    </MemoryRouter>,
  )
}

describe('EventListWidget', () => {
  it('рендерит список событий', () => {
    renderWidget({ items: mockEvents })
    expect(screen.getByText('Летний поход')).toBeInTheDocument()
    expect(screen.getByText('Новый год')).toBeInTheDocument()
  })

  it('показывает empty state при пустом массиве', () => {
    renderWidget({ items: [] })
    expect(screen.getByText(/пока нет событий/i)).toBeInTheDocument()
  })

  it('кнопка "Создать" вызывает onCreateEvent', () => {
    const onCreateEvent = vi.fn()
    renderWidget({ items: [], onCreateEvent })
    fireEvent.click(screen.getByRole('button', { name: /создать/i }))
    expect(onCreateEvent).toHaveBeenCalledTimes(1)
  })

  it('показывает скелетон при isLoading=true', () => {
    renderWidget({ items: undefined, isLoading: true })
    expect(screen.queryByText(/пока нет событий/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('каждая карточка события является ссылкой', () => {
    renderWidget({ items: mockEvents })
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
  })

  it('показывает статус события', () => {
    renderWidget({ items: [mockEvents[0]] })
    expect(screen.getByText('Активно')).toBeInTheDocument()
  })
})
