import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/shared/api/api'
import { useUserStore } from '@/entities/user/model/useUserStore'
import { NotificationsBell } from '@/widgets/notifications-bell'

vi.mock('@/shared/assets/icons/notification.svg?react', () => ({
  default: () => <svg data-testid="notification-icon" />,
}))

const mock = new MockAdapter(api)

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('NotificationsBell', () => {
  beforeEach(() => {
    useUserStore.setState({
      isAuthenticated: true,
      user: null,
      isAuthResolved: true,
      isLoading: false,
    })
  })

  afterEach(() => {
    mock.reset()
    useUserStore.setState({
      isAuthenticated: false,
      user: null,
      isAuthResolved: false,
      isLoading: false,
    })
  })

  it('не рендерит ничего если пользователь не аутентифицирован', () => {
    useUserStore.setState({ isAuthenticated: false })
    const { container } = render(<NotificationsBell />, { wrapper })
    expect(container).toBeEmptyDOMElement()
  })

  it('рендерит кнопку уведомлений', () => {
    mock.onGet('/api/notifications').reply(200, { items: [], unreadCount: 0 })
    mock.onGet('/api/expenses/participant/inbox').reply(200, { list_inbox: [] })

    render(<NotificationsBell />, { wrapper })
    expect(screen.getByRole('button', { name: /уведомления/i })).toBeInTheDocument()
  })

  it('показывает badge с числом непрочитанных', async () => {
    mock.onGet('/api/notifications').reply(200, {
      items: [{ id: 'n1', eventId: null, expenseId: null, title: 'Test', message: 'msg', isRead: false, createdAt: '2026-01-01' }],
      unreadCount: 1,
    })
    mock.onGet('/api/expenses/participant/inbox').reply(200, { list_inbox: [] })

    render(<NotificationsBell />, { wrapper })

    await waitFor(() => {
      expect(screen.getByLabelText(/непрочитанных: 1/i)).toBeInTheDocument()
    })
  })

  it('открывает список уведомлений при клике', async () => {
    mock.onGet('/api/notifications').reply(200, { items: [], unreadCount: 0 })
    mock.onGet('/api/expenses/participant/inbox').reply(200, { list_inbox: [] })

    render(<NotificationsBell />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /уведомления/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /уведомления/i })).toBeInTheDocument()
    })
  })

  it('показывает "Пока ничего нет" при пустом списке', async () => {
    mock.onGet('/api/notifications').reply(200, { items: [], unreadCount: 0 })
    mock.onGet('/api/expenses/participant/inbox').reply(200, { list_inbox: [] })

    render(<NotificationsBell />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /уведомления/i }))

    await waitFor(() => {
      expect(screen.getByText(/пока ничего нет/i)).toBeInTheDocument()
    })
  })
})
