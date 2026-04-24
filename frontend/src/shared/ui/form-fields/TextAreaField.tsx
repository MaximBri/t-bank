import type { FieldPath, FieldValues } from 'react-hook-form'

import type { TextAreaFieldConfig } from '@/shared/lib/forms'

import { BaseField } from './BaseField.tsx'
import clsx from 'clsx'
import { FormFieldVariant } from '@/shared/lib/forms/types.ts'

type TextAreaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<TextAreaFieldConfig<TFieldValues, TName>, 'type'>

export const TextAreaField = <
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
  rows = 4,
  variant = FormFieldVariant.Filled,
}: TextAreaFieldProps<TFieldValues, TName>) => {
  return (
    <BaseField
      name={name}
      label={label}
      variant={variant}
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
          <textarea
            {...field}
            id={id}
            value={inputValue}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(event) => field.onChange(event.target.value)}
            className={clsx(inputClassName, 'flex-1')}
            aria-invalid={errorMessage ? 'true' : 'false'}
            aria-describedby={errorMessage ? `${id}-error` : undefined}
          />
        )
      }}
    />
  )
}
