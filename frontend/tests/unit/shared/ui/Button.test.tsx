import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/shared/ui/button/Button'
import { ButtonEnum } from '@/shared/ui/button/constants'

describe('Button', () => {
  it('рендерит текст кнопки', () => {
    render(<Button>Нажми меня</Button>)
    expect(screen.getByRole('button', { name: 'Нажми меня' })).toBeInTheDocument()
  })

  it('вызывает onClick при клике', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Кнопка</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('не вызывает onClick когда disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Кнопка</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('кнопка disabled когда isLoading=true', () => {
    render(<Button isLoading>Кнопка</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('показывает spinner когда isLoading=true', () => {
    render(<Button isLoading>Кнопка</Button>)
    expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('применяет className', () => {
    render(<Button className="custom-class">Кнопка</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('рендерит вариант Secondary', () => {
    render(<Button variant={ButtonEnum.Secondary}>Кнопка</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })

  it('рендерит вариант TertiaryLight', () => {
    render(<Button variant={ButtonEnum.TertiaryLight}>Удалить</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-error-light')
  })
})
