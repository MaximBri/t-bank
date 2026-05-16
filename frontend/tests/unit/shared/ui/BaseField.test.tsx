import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useForm, FormProvider } from 'react-hook-form'
import type { ReactNode } from 'react'
import { BaseField } from '@/shared/ui/form-fields/BaseField'
import { FormFieldVariant } from '@/shared/lib/forms/types'

function Wrapper({
  children,
  defaultValues,
}: {
  children: ReactNode
  defaultValues?: Record<string, unknown>
}) {
  const methods = useForm({ defaultValues })
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('BaseField', () => {
  it('рендерит label', () => {
    render(
      <Wrapper>
        <BaseField
          name="title"
          label="Заголовок"
          defaultValue=""
          isValuePresent={(v) => typeof v === 'string' && v.length > 0}
          renderInput={({ id, inputClassName }) => (
            <input id={id} className={inputClassName} />
          )}
        />
      </Wrapper>,
    )
    expect(screen.getByText('Заголовок')).toBeInTheDocument()
  })

  it('id поля совпадает с name', () => {
    render(
      <Wrapper>
        <BaseField
          name="myfield"
          label="Поле"
          defaultValue=""
          isValuePresent={() => false}
          renderInput={({ id, inputClassName }) => (
            <input id={id} className={inputClassName} data-testid="input" />
          )}
        />
      </Wrapper>,
    )
    expect(screen.getByTestId('input').id).toBe('field-myfield')
  })

  it('показывает звёздочку при required=true', () => {
    render(
      <Wrapper>
        <BaseField
          name="title"
          label="Поле"
          required
          defaultValue=""
          isValuePresent={() => false}
          renderInput={({ id, inputClassName }) => (
            <input id={id} className={inputClassName} />
          )}
        />
      </Wrapper>,
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('не показывает сообщение об ошибке без ошибки', () => {
    render(
      <Wrapper>
        <BaseField
          name="title"
          label="Поле"
          defaultValue=""
          isValuePresent={() => false}
          renderInput={({ id, inputClassName }) => (
            <input id={id} className={inputClassName} />
          )}
        />
      </Wrapper>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('не показывает кнопку очистки когда hasValue=false', () => {
    render(
      <Wrapper>
        <BaseField
          name="title"
          label="Поле"
          defaultValue=""
          isValuePresent={() => false}
          renderInput={({ id, inputClassName }) => (
            <input id={id} className={inputClassName} />
          )}
        />
      </Wrapper>,
    )
    expect(screen.queryByRole('button', { name: 'Clear field' })).not.toBeInTheDocument()
  })

  it('показывает кнопку очистки когда isValuePresent возвращает true', () => {
    render(
      <Wrapper defaultValues={{ title: 'текст' }}>
        <BaseField
          name="title"
          label="Поле"
          defaultValue="текст"
          isValuePresent={(v) => typeof v === 'string' && v.length > 0}
          renderInput={({ id, inputClassName, field }) => (
            <input id={id} className={inputClassName} {...field} />
          )}
        />
      </Wrapper>,
    )
    expect(screen.getByRole('button', { name: 'Clear field' })).toBeInTheDocument()
  })

  it('не показывает кнопку очистки при withoutClearButton=true', () => {
    render(
      <Wrapper defaultValues={{ title: 'текст' }}>
        <BaseField
          name="title"
          label="Поле"
          defaultValue="текст"
          withoutClearButton
          isValuePresent={() => true}
          renderInput={({ id, inputClassName, field }) => (
            <input id={id} className={inputClassName} {...field} />
          )}
        />
      </Wrapper>,
    )
    expect(screen.queryByRole('button', { name: 'Clear field' })).not.toBeInTheDocument()
  })

  it('применяет className варианта Filled к input', () => {
    render(
      <Wrapper>
        <BaseField
          name="title"
          label="Поле"
          defaultValue=""
          variant={FormFieldVariant.Filled}
          isValuePresent={() => false}
          renderInput={({ id, inputClassName }) => (
            <input id={id} className={inputClassName} data-testid="input" />
          )}
        />
      </Wrapper>,
    )
    expect(screen.getByTestId('input')).toHaveClass('bg-input-primary')
  })

  it('применяет className варианта Outlined к input', () => {
    render(
      <Wrapper>
        <BaseField
          name="title"
          label="Поле"
          defaultValue=""
          variant={FormFieldVariant.Outlined}
          isValuePresent={() => false}
          renderInput={({ id, inputClassName }) => (
            <input id={id} className={inputClassName} data-testid="input" />
          )}
        />
      </Wrapper>,
    )
    expect(screen.getByTestId('input')).toHaveClass('bg-secondary')
  })

  it('передаёт errorMessage в renderInput', async () => {
    const { rerender } = render(
      <Wrapper>
        <BaseField
          name="title"
          label="Поле"
          defaultValue=""
          rules={{ required: 'Обязательное поле' }}
          isValuePresent={() => false}
          renderInput={({ id, inputClassName, errorMessage }) => (
            <>
              <input id={id} className={inputClassName} />
              {errorMessage && <span data-testid="custom-error">{errorMessage}</span>}
            </>
          )}
        />
      </Wrapper>,
    )
    // No error initially
    expect(screen.queryByTestId('custom-error')).not.toBeInTheDocument()
    rerender(
      <Wrapper>
        <BaseField
          name="title"
          label="Поле"
          defaultValue=""
          rules={{ required: 'Обязательное поле' }}
          isValuePresent={() => false}
          renderInput={({ id, inputClassName, errorMessage }) => (
            <>
              <input id={id} className={inputClassName} />
              {errorMessage && <span data-testid="custom-error">{errorMessage}</span>}
            </>
          )}
        />
      </Wrapper>,
    )
  })

  it('кнопка очистки присутствует в DOM и кликабельна', () => {
    render(
      <Wrapper defaultValues={{ title: 'значение' }}>
        <BaseField
          name="title"
          label="Поле"
          defaultValue="значение"
          isValuePresent={(v) => typeof v === 'string' && v.length > 0}
          renderInput={({ id, inputClassName, field }) => (
            <input id={id} className={inputClassName} {...field} data-testid="input" />
          )}
        />
      </Wrapper>,
    )
    const clearButton = screen.getByRole('button', { name: 'Clear field' })
    expect(clearButton).toBeInTheDocument()
    expect(clearButton).not.toBeDisabled()
  })
})
