import type { FieldPath, FieldValues } from 'react-hook-form'

import type { TextFieldConfig } from '@/shared/lib/forms'
import { BaseField } from './BaseField.tsx'

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
  placeholder,
  disabled,
  required,
  defaultValue,
  rules,
  type,
}: TextFieldProps<TFieldValues, TName>) => {
  return (
    <BaseField
      name={name}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      defaultValue={(defaultValue ?? '') as TFieldValues[TName]}
      rules={rules}
      isValuePresent={(value) => typeof value === 'string' && value.length > 0}
      renderInput={({ field, errorMessage, id, inputClassName }) => {
        const inputValue = typeof field.value === 'string' ? field.value : ''

        return (
          <input
            {...field}
            id={id}
            type={type}
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
        )
      }}
    />
  )
}
