import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { CreateEventModal } from '@/features/CreateEventModal/ui/CreateEventModal'

vi.mock('@/entities/event/api/hooks/useCreateEvent', () => ({
  useCreateEvent: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@/entities/event/api/hooks/useUpdateEvent', () => ({
  useUpdateEvent: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

const mockAxios = new MockAdapter(axios)

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function renderModal(isOpen = true, onClose = vi.fn()) {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CreateEventModal isOpen={isOpen} onClose={onClose} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CreateEventModal', () => {
  beforeEach(() => {
    mockAxios.reset()
    mockAxios.onPost('/api/events').reply(200, { id: 'event-1', title: 'Test Event' })
  })

  it('рендерится когда isOpen=true', () => {
    renderModal(true)
    expect(screen.getByText('Создание события')).toBeInTheDocument()
  })

  it('не рендерится когда isOpen=false', () => {
    renderModal(false)
    expect(screen.queryByText('Создание события')).not.toBeInTheDocument()
  })

  it('содержит поле названия события', () => {
    renderModal()
    expect(document.querySelector('input[name="title"]')).toBeInTheDocument()
  })

  it('содержит поле даты начала', () => {
    renderModal()
    expect(document.querySelector('input[name="startDate"]')).toBeInTheDocument()
  })

  it('содержит поле даты конца', () => {
    renderModal()
    expect(document.querySelector('input[name="endDate"]')).toBeInTheDocument()
  })

  it('содержит поле описания', () => {
    renderModal()
    expect(document.querySelector('textarea[name="description"]')).toBeInTheDocument()
  })

  it('содержит кнопку создания', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /создать/i })).toBeInTheDocument()
  })

  it('показывает ошибки валидации при пустом сабмите', async () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /создать/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/поле обязательно/i).length).toBeGreaterThan(0)
    })
  })

  it('вызывает onClose при клике на кнопку закрытия', () => {
    const onClose = vi.fn()
    renderModal(true, onClose)
    fireEvent.click(screen.getByRole('button', { name: /close-create-event-modal/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('вызывает onClose при нажатии Escape', async () => {
    const onClose = vi.fn()
    renderModal(true, onClose)
    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('показывает заголовок "Редактирование события" при передаче event', () => {
    const queryClient = createQueryClient()
    const mockEvent = {
      id: 'event-1',
      title: 'Test Event',
      description: 'Test description',
      startDate: '2026-06-01T00:00:00.000Z',
      endDate: '2026-06-10T00:00:00.000Z',
      imageKey: '',
      categories: [],
    }
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CreateEventModal isOpen={true} onClose={vi.fn()} event={mockEvent as any} />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(screen.getByText('Редактирование события')).toBeInTheDocument()
  })
})
