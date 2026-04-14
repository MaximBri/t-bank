import type { FieldPath, FieldValues } from 'react-hook-form'

import type { NumberFieldConfig } from '@/shared/lib/forms'
import { parseNumberValue } from '@/shared/lib/number/parse-number.ts'
import { BaseField } from './BaseField.tsx'

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
  fieldClassName,
  placeholder,
  disabled,
  required,
  defaultValue,
  rules,
  min,
  max,
  step,
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
      defaultValue={(defaultValue ?? undefined) as TFieldValues[TName]}
      rules={rules}
      isValuePresent={(value) => typeof value === 'number' && !Number.isNaN(value)}
      renderInput={({ field, errorMessage, id, inputClassName }) => {
        const inputValue = typeof field.value === 'number' ? String(field.value) : ''

        return (
          <input
            {...field}
            id={id}
            type="number"
            inputMode="decimal"
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            onChange={(event) => field.onChange(parseNumberValue(event.target.value))}
            className={inputClassName}
            aria-invalid={errorMessage ? 'true' : 'false'}
            aria-describedby={errorMessage ? `${id}-error` : undefined}
          />
        )
      }}
    />
  )
}
