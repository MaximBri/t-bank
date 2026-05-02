import type { FieldPath, FieldValues } from 'react-hook-form'

import type { TextFieldConfig } from '@/shared/lib/forms'
import { BaseField } from './BaseField.tsx'
import { FormFieldVariant } from '@/shared/lib/forms/types.ts'
import { useState } from 'react'
import EyeIcon from '@/shared/assets/icons/eye.svg?react'
import ClosedEyeIcon from '@/shared/assets/icons/closed-eye.svg?react'

type TextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = TextFieldConfig<TFieldValues, TName>

export const TextField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  labelClassName,
  fieldClassName,
  placeholder,
  disabled,
  required,
  defaultValue,
  rules,
  type,
  variant = FormFieldVariant.Filled,
  withoutClearButton,
}: TextFieldProps<TFieldValues, TName>) => {
  const [visibleValue, setVisibleValue] = useState(false)
  const isPasswordField = type === 'password'
  const resolvedType = isPasswordField ? (visibleValue ? 'text' : 'password') : type

  return (
    <BaseField
      name={name}
      label={label}
      labelClassName={labelClassName}
      fieldClassName={fieldClassName}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      defaultValue={(defaultValue ?? '') as TFieldValues[TName]}
      rules={rules}
      variant={variant}
      withoutClearButton={withoutClearButton}
      isValuePresent={(value) => typeof value === 'string' && value.length > 0}
      renderInput={({ field, errorMessage, id, inputClassName }) => {
        const inputValue = typeof field.value === 'string' ? field.value : ''

        return (
          <>
            <input
              {...field}
              id={id}
              type={resolvedType}
              value={inputValue}
              placeholder={placeholder}
              disabled={disabled}
              onChange={(event) => {
                field.onChange(event.target.value)
              }}
              className={inputClassName}
              aria-invalid={errorMessage ? 'true' : 'false'}
              aria-describedby={errorMessage ? `${id}-error` : undefined}
            />
            {isPasswordField && (
              <button
                type="button"
                onClick={() => setVisibleValue((prev) => !prev)}
                disabled={disabled}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                aria-label={visibleValue ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {!visibleValue ? <EyeIcon width={22} height={22} /> : <ClosedEyeIcon />}
              </button>
            )}
          </>
        )
      }}
    />
  )
}
