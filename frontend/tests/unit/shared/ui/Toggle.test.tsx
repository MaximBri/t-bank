import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Toggle } from '@/shared/ui/toggle/Toggle'

describe('Toggle', () => {
  it('renders as switch button', () => {
    render(<Toggle checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('reflects checked state via aria-checked', () => {
    render(<Toggle checked={true} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('reflects unchecked state via aria-checked', () => {
    render(<Toggle checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with toggled value on click', () => {
    const onChange = vi.fn()
    render(<Toggle checked={false} onChange={onChange} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when currently checked', () => {
    const onChange = vi.fn()
    render(<Toggle checked={true} onChange={onChange} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Toggle checked={false} onChange={vi.fn()} disabled={true} />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('renders aria-label when provided', () => {
    render(<Toggle checked={false} onChange={vi.fn()} aria-label="dark mode" />)
    expect(screen.getByRole('switch', { name: 'dark mode' })).toBeInTheDocument()
  })
})
