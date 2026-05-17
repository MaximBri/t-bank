import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, it, expect, vi } from 'vitest'

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})
import { EventSectionsNavWidget } from '@/widgets/event-sections-nav/ui/EventSectionsNavWidget'
import { EventSection } from '@/widgets/event-sections-nav'

vi.mock('@/widgets/event-sections-nav/lib/get-icon-by-section.tsx', () => ({
  getIconBySection: () => null,
}))

describe('EventSectionsNavWidget', () => {
  it('рендерит все вкладки навигации', () => {
    render(<EventSectionsNavWidget activeSection={EventSection.expenses} onSectionChange={vi.fn()} />)
    expect(screen.getByText('Расходы')).toBeInTheDocument()
    expect(screen.getByText('Взаиморасчёты')).toBeInTheDocument()
    expect(screen.getByText('Участники')).toBeInTheDocument()
    expect(screen.getByText('История')).toBeInTheDocument()
  })

  it('вызывает onSectionChange при клике на вкладку', () => {
    const onSectionChange = vi.fn()
    render(<EventSectionsNavWidget activeSection={EventSection.expenses} onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByText('Взаиморасчёты'))
    expect(onSectionChange).toHaveBeenCalledWith(EventSection.settlements)
  })

  it('рендерит вкладку "Участники" кликабельной', () => {
    const onSectionChange = vi.fn()
    render(<EventSectionsNavWidget activeSection={EventSection.expenses} onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByText('Участники'))
    expect(onSectionChange).toHaveBeenCalledWith(EventSection.participants)
  })
})
