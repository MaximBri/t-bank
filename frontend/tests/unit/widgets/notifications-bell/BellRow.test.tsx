import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BellRow } from '@/widgets/notifications-bell/ui/BellRow'

describe('BellRow', () => {
  it('рендерит дочерние элементы', () => {
    render(<BellRow><span>content</span></BellRow>)
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('применяет подсветку когда isHighlighted=true', () => {
    const { container } = render(<BellRow isHighlighted><span>x</span></BellRow>)
    expect(container.firstChild).toHaveClass('bg-primary/40')
  })

  it('не применяет подсветку по умолчанию', () => {
    const { container } = render(<BellRow><span>x</span></BellRow>)
    expect(container.firstChild).not.toHaveClass('bg-primary/40')
  })
})
