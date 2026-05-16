import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Toggle } from '@/shared/ui/toggle/Toggle'

describe('Toggle', () => {
  it('отображается как кнопка-переключатель', () => {
    render(<Toggle checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('отражает включённое состояние через aria-checked', () => {
    render(<Toggle checked={true} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('отражает выключенное состояние через aria-checked', () => {
    render(<Toggle checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('вызывает onChange с инвертированным значением при клике', () => {
    const onChange = vi.fn()
    render(<Toggle checked={false} onChange={onChange} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('вызывает onChange с false когда переключатель включён', () => {
    const onChange = vi.fn()
    render(<Toggle checked={true} onChange={onChange} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('заблокирован когда передан проп disabled=true', () => {
    render(<Toggle checked={false} onChange={vi.fn()} disabled={true} />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('отображает aria-label когда он передан', () => {
    render(<Toggle checked={false} onChange={vi.fn()} aria-label="dark mode" />)
    expect(screen.getByRole('switch', { name: 'dark mode' })).toBeInTheDocument()
  })
})
