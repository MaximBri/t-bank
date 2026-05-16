import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { renderActiveWidget } from './renderActiveWidget'
import { EventSection } from '@/widgets/event-sections-nav'

vi.mock('@/widgets/event-expenses', () => ({ EventExpensesWidget: () => <div>expenses</div> }))
vi.mock('@/widgets/event-settlements/ui/EventSettlementsWidget.tsx', () => ({ EventSettlementsWidget: () => <div>settlements</div> }))
vi.mock('@/widgets/event-history', () => ({ EventHistoryWidget: () => <div>history</div> }))
vi.mock('@/widgets/event-participants/ui/EventParticipantsWidget.tsx', () => ({ EventParticipantsWidget: () => <div>participants</div> }))
vi.mock('@/widgets/event-section-placeholder', () => ({ EventSectionPlaceholderWidget: ({ section }: any) => <div>placeholder-{section}</div> }))

describe('renderActiveWidget', () => {
  it('рендерит виджет расходов для секции expenses', () => {
    const { getByText } = render(<>{renderActiveWidget(EventSection.expenses)}</>)
    expect(getByText('expenses')).toBeInTheDocument()
  })

  it('рендерит виджет расчётов для секции settlements', () => {
    const { getByText } = render(<>{renderActiveWidget(EventSection.settlements)}</>)
    expect(getByText('settlements')).toBeInTheDocument()
  })

  it('рендерит виджет истории для секции history', () => {
    const { getByText } = render(<>{renderActiveWidget(EventSection.history)}</>)
    expect(getByText('history')).toBeInTheDocument()
  })

  it('рендерит виджет участников для секции participants', () => {
    const { getByText } = render(<>{renderActiveWidget(EventSection.participants)}</>)
    expect(getByText('participants')).toBeInTheDocument()
  })

  it('использует expenses по умолчанию когда секция не передана', () => {
    const { getByText } = render(<>{renderActiveWidget()}</>)
    expect(getByText('expenses')).toBeInTheDocument()
  })
})
