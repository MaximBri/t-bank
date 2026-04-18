import type { FieldPath, FieldValues } from 'react-hook-form'

import type { DateFieldConfig } from '@/shared/lib/forms'
import { DateInput } from '@/shared/ui/inputs'

import { BaseField } from './BaseField.tsx'

type DateFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<DateFieldConfig<TFieldValues, TName>, 'type'> & {
  calendarIconSize?: number | string
}

export const DateField = <
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
  minDate,
  maxDate,
  calendarIconSize,
}: DateFieldProps<TFieldValues, TName>) => {
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
      isValuePresent={(value) => typeof value === 'string' && value.length > 0}
      renderInput={({ field, errorMessage, id, inputClassName }) => {
        const inputValue = typeof field.value === 'string' ? field.value : ''

        return (
          <DateInput
            {...field}
            id={id}
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            min={minDate}
            max={maxDate}
            calendarIconSize={calendarIconSize}
            onChange={(event) => field.onChange(event.target.value)}
            className={inputClassName}
            aria-invalid={errorMessage ? 'true' : 'false'}
            aria-describedby={errorMessage ? `${id}-error` : undefined}
          />
        )
      }}
    />
  )
}
