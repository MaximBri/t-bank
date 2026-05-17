import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Text } from '@/shared/ui/text/Text'

describe('Text', () => {
  it('рендерит дочерний текст', () => {
    render(<Text>Привет, мир</Text>)
    expect(screen.getByText('Привет, мир')).toBeInTheDocument()
  })

  it('по умолчанию рендерит тег <p>', () => {
    render(<Text>Параграф</Text>)
    const el = screen.getByText('Параграф')
    expect(el.tagName).toBe('P')
  })

  it('рендерит нужный тег через prop as', () => {
    render(<Text as="h1">Заголовок</Text>)
    const el = screen.getByText('Заголовок')
    expect(el.tagName).toBe('H1')
  })

  it('рендерит тег span через prop as', () => {
    render(<Text as="span">Спан</Text>)
    expect(screen.getByText('Спан').tagName).toBe('SPAN')
  })

  it('применяет класс для варианта body (по умолчанию)', () => {
    render(<Text>Тело</Text>)
    expect(screen.getByText('Тело')).toHaveClass('text-body')
  })

  it('применяет класс для варианта h1', () => {
    render(<Text variant="h1">Заголовок 1</Text>)
    expect(screen.getByText('Заголовок 1')).toHaveClass('text-h1')
  })

  it('применяет класс для варианта h2', () => {
    render(<Text variant="h2">Заголовок 2</Text>)
    expect(screen.getByText('Заголовок 2')).toHaveClass('text-h2')
  })

  it('применяет класс для варианта h3', () => {
    render(<Text variant="h3">Заголовок 3</Text>)
    expect(screen.getByText('Заголовок 3')).toHaveClass('text-h3')
  })

  it('применяет класс для варианта small', () => {
    render(<Text variant="small">Маленький</Text>)
    expect(screen.getByText('Маленький')).toHaveClass('text-small')
  })

  it('применяет класс для варианта caption', () => {
    render(<Text variant="caption">Подпись</Text>)
    expect(screen.getByText('Подпись')).toHaveClass('text-caption')
  })

  it('применяет дополнительный className', () => {
    render(<Text className="custom-class">Текст</Text>)
    expect(screen.getByText('Текст')).toHaveClass('custom-class')
  })

  it('объединяет вариантный класс и дополнительный className', () => {
    render(
      <Text variant="h2" className="extra">
        Комбо
      </Text>,
    )
    const el = screen.getByText('Комбо')
    expect(el).toHaveClass('text-h2')
    expect(el).toHaveClass('extra')
  })
})
