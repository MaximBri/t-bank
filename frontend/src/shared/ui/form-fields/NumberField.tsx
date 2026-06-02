import type { FieldPath, FieldValues } from 'react-hook-form'

import type { NumberFieldConfig } from '@/shared/lib/forms'
import { parseNumberValue } from '@/shared/lib/number/parseNumber.ts'
import { BaseField } from './BaseField.tsx'
import { FormFieldVariant } from '@/shared/lib/forms/types.ts'

type NumberFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<NumberFieldConfig<TFieldValues, TName>, 'type'>

export const NumberField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  labelClassName,
  withoutClearButton,
  fieldClassName,
  placeholder,
  disabled,
  required,
  defaultValue,
  rules,
  min,
  max,
  step,
  variant = FormFieldVariant.Filled,
}: NumberFieldProps<TFieldValues, TName>) => {
  return (
    <BaseField
      name={name}
      label={label}
      labelClassName={labelClassName}
      fieldClassName={fieldClassName}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      variant={variant}
      withoutClearButton={withoutClearButton}
      defaultValue={(defaultValue ?? undefined) as TFieldValues[TName]}
      rules={rules}
      isValuePresent={(value) =>
        (typeof value === 'number' && !Number.isNaN(value)) ||
        (typeof value === 'string' && value.trim() !== '')
      }
      renderInput={({ field, errorMessage, id, inputClassName }) => {
        const inputValue =
          typeof field.value === 'number' || typeof field.value === 'string'
            ? String(field.value)
            : ''
        const decimalPattern =
          min !== undefined && min >= 0
            ? /^(\d+([.,]\d*)?|[.,]\d*)?$/
            : /^-?(\d+([.,]\d*)?|[.,]\d*)?$/

        return (
          <input
            {...field}
            id={id}
            type="text"
            inputMode="decimal"
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            onChange={(event) => {
              const nextValue = event.target.value
              if (decimalPattern.test(nextValue)) {
                field.onChange(nextValue)
              }
            }}
            onBlur={(event) => {
              field.onBlur()
              field.onChange(parseNumberValue(event.target.value))
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
