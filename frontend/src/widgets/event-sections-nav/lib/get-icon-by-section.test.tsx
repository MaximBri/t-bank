import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { getIconBySection } from './get-icon-by-section'
import { EventSection } from '@/widgets/event-sections-nav'

vi.mock('@/shared/assets/icons/coins.svg?react', () => ({ default: () => <svg data-testid="coins-icon" /> }))
vi.mock('@/shared/assets/icons/arrow-growth.svg?react', () => ({ default: () => <svg data-testid="arrow-icon" /> }))
vi.mock('@/shared/assets/icons/users.svg?react', () => ({ default: () => <svg data-testid="users-icon" /> }))
vi.mock('@/shared/assets/icons/history.svg?react', () => ({ default: () => <svg data-testid="history-icon" /> }))

describe('getIconBySection', () => {
  it('возвращает иконку монет для секции expenses', () => {
    const { getByTestId } = render(<>{getIconBySection(EventSection.expenses)}</>)
    expect(getByTestId('coins-icon')).toBeInTheDocument()
  })

  it('возвращает иконку стрелки для секции settlements', () => {
    const { getByTestId } = render(<>{getIconBySection(EventSection.settlements)}</>)
    expect(getByTestId('arrow-icon')).toBeInTheDocument()
  })

  it('возвращает иконку участников для секции participants', () => {
    const { getByTestId } = render(<>{getIconBySection(EventSection.participants)}</>)
    expect(getByTestId('users-icon')).toBeInTheDocument()
  })

  it('возвращает иконку истории для секции history', () => {
    const { getByTestId } = render(<>{getIconBySection(EventSection.history)}</>)
    expect(getByTestId('history-icon')).toBeInTheDocument()
  })
})
