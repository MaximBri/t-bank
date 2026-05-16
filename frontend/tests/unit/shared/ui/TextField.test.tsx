import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useForm, FormProvider } from 'react-hook-form'
import type { ReactNode } from 'react'
import { TextField } from '@/shared/ui/form-fields/TextField'

function Wrapper({ children }: { children: ReactNode }) {
  const methods = useForm()
  return <FormProvider {...methods}>{children}</FormProvider>
}

function WrapperWithValues({
  children,
  defaultValues,
}: {
  children: ReactNode
  defaultValues?: Record<string, unknown>
}) {
  const methods = useForm({ defaultValues })
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('TextField', () => {
  it('рендерит label', () => {
    render(
      <Wrapper>
        <TextField name="username" label="Имя пользователя" />
      </Wrapper>,
    )
    expect(screen.getByText('Имя пользователя')).toBeInTheDocument()
  })

  it('рендерит input элемент', () => {
    render(
      <Wrapper>
        <TextField name="email" label="Email" />
      </Wrapper>,
    )
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('label связан с input через htmlFor/id', () => {
    render(
      <Wrapper>
        <TextField name="email" label="Email" />
      </Wrapper>,
    )
    const input = screen.getByRole('textbox')
    expect(input.id).toBe('field-email')
    expect(screen.getByText('Email').closest('label')).toHaveAttribute('for', 'field-email')
  })

  it('отображает placeholder', () => {
    render(
      <Wrapper>
        <TextField name="username" label="Имя" placeholder="Введите имя" />
      </Wrapper>,
    )
    expect(screen.getByPlaceholderText('Введите имя')).toBeInTheDocument()
  })

  it('поле disabled когда передан disabled=true', () => {
    render(
      <Wrapper>
        <TextField name="username" label="Имя" disabled />
      </Wrapper>,
    )
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('показывает звёздочку когда required=true', () => {
    render(
      <Wrapper>
        <TextField name="username" label="Имя" required />
      </Wrapper>,
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('не показывает звёздочку когда required не задан', () => {
    render(
      <Wrapper>
        <TextField name="username" label="Имя" />
      </Wrapper>,
    )
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('принимает ввод пользователя', () => {
    render(
      <Wrapper>
        <TextField name="username" label="Имя" />
      </Wrapper>,
    )
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Иван' } })
    expect(input.value).toBe('Иван')
  })

  it('устанавливает aria-invalid="false" без ошибки', () => {
    render(
      <Wrapper>
        <TextField name="username" label="Имя" />
      </Wrapper>,
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false')
  })

  it('рендерит поле с типом password и кнопку показа пароля', () => {
    render(
      <Wrapper>
        <TextField name="password" label="Пароль" type="password" />
      </Wrapper>,
    )
    const input = screen.getByLabelText('Пароль') as HTMLInputElement
    expect(input.type).toBe('password')
    expect(screen.getByRole('button', { name: 'Показать пароль' })).toBeInTheDocument()
  })

  it('переключает видимость пароля при клике на кнопку', () => {
    render(
      <Wrapper>
        <TextField name="password" label="Пароль" type="password" />
      </Wrapper>,
    )
    const input = screen.getByLabelText('Пароль') as HTMLInputElement
    const toggleButton = screen.getByRole('button', { name: 'Показать пароль' })

    expect(input.type).toBe('password')
    fireEvent.click(toggleButton)
    expect(input.type).toBe('text')
    expect(screen.getByRole('button', { name: 'Скрыть пароль' })).toBeInTheDocument()
  })

  it('кнопка показа пароля disabled когда поле disabled', () => {
    render(
      <Wrapper>
        <TextField name="password" label="Пароль" type="password" disabled />
      </Wrapper>,
    )
    expect(screen.getByRole('button', { name: 'Показать пароль' })).toBeDisabled()
  })

  it('показывает кнопку очистки при наличии значения', () => {
    render(
      <WrapperWithValues defaultValues={{ search: 'тест' }}>
        <TextField name="search" label="Поиск" />
      </WrapperWithValues>,
    )
    expect(screen.getByRole('button', { name: 'Clear field' })).toBeInTheDocument()
  })

  it('не показывает кнопку очистки когда withoutClearButton=true', () => {
    render(
      <WrapperWithValues defaultValues={{ search: 'тест' }}>
        <TextField name="search" label="Поиск" withoutClearButton />
      </WrapperWithValues>,
    )
    expect(screen.queryByRole('button', { name: 'Clear field' })).not.toBeInTheDocument()
  })
})
