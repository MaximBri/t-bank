import type { FieldPath, FieldValues } from 'react-hook-form'

import type { SelectFieldConfig } from '@/shared/lib/forms'
import { BaseField } from './BaseField.tsx'
import { FormFieldVariant } from '@/shared/lib/forms/types.ts'
import clsx from 'clsx'

import ArrowIcon from '@/shared/assets/icons/arrow.svg?react'

type SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = SelectFieldConfig<TFieldValues, TName>

export const SelectField = <
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
  options,
  variant = FormFieldVariant.Filled,
}: SelectFieldProps<TFieldValues, TName>) => {
  return (
    <BaseField
      name={name}
      label={label}
      labelClassName={labelClassName}
      fieldClassName={fieldClassName}
      disabled={disabled}
      required={required}
      defaultValue={(defaultValue ?? '') as TFieldValues[TName]}
      rules={rules}
      variant={variant}
      withoutClearButton
      isValuePresent={(value) => typeof value === 'string' && value.length > 0}
      renderInput={({ field, errorMessage, id, inputClassName }) => {
        const inputValue = typeof field.value === 'string' ? field.value : ''

        return (
          <div className="relative">
            <select
              {...field}
              id={id}
              value={inputValue}
              disabled={disabled}
              onChange={(event) => field.onChange(event.target.value)}
              className={clsx(inputClassName, 'appearance-none pl-[16px]')}
              aria-invalid={errorMessage ? 'true' : 'false'}
              aria-describedby={errorMessage ? `${id}-error` : undefined}
            >
              <option value="" disabled>
                {placeholder ?? 'Выберите значение'}
              </option>
              {options.map((option) => (
                <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </select>
            <ArrowIcon
              width={20}
              height={20}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90"
              aria-hidden="true"
            />
          </div>
        )
      }}
    />
  )
}
