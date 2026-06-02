import { screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useUserStore } from '@/entities/user'
import { renderWithProviders } from '../../utils/renderWithProviders.tsx'

vi.mock('@/shared/assets/icons/logo.svg?react', () => ({ default: () => null }))
vi.mock('@/widgets/notifications-bell', () => ({ NotificationsBell: () => null }))
vi.mock('react-responsive', () => ({ useMediaQuery: vi.fn(() => false) }))

import { AppLayout } from '@/shared/ui/layout/AppLayout'

describe('AppLayout', () => {
  it('рендерит заголовок с логотипом', () => {
    useUserStore.setState({ user: null })
    renderWithProviders(<AppLayout />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('рендерит название приложения', () => {
    useUserStore.setState({ user: null })
    renderWithProviders(<AppLayout />)
    expect(screen.getByText('Т-Ивент')).toBeInTheDocument()
  })

  it('рендерит ссылку на главную', () => {
    useUserStore.setState({ user: null })
    renderWithProviders(<AppLayout />)
    expect(screen.getByRole('link', { name: 'Перейти на главную' })).toBeInTheDocument()
  })

  it('рендерит ссылку на профиль', () => {
    useUserStore.setState({ user: null })
    renderWithProviders(<AppLayout />)
    expect(screen.getByRole('link', { name: 'Перейти в профиль' })).toBeInTheDocument()
  })
})
