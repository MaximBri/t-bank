import clsx from 'clsx'
import type { ReactNode } from 'react'
import {
  Controller,
  useFormContext,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import type { BaseFieldConfig } from '@/shared/lib/forms'
import { ClearFieldButton } from '@/shared/ui/form'
import { FormFieldVariant } from '@/shared/lib/forms/types'

type BaseFieldRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  ariaDescribedBy?: string
  errorMessage?: string
  field: ControllerRenderProps<TFieldValues, TName>
  hasValue: boolean
  id: string
  inputClassName: string
}

type BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Pick<
  BaseFieldConfig<TFieldValues, TName>,
  | 'name'
  | 'label'
  | 'labelClassName'
  | 'fieldClassName'
  | 'placeholder'
  | 'disabled'
  | 'required'
  | 'rules'
> & {
  defaultValue: TFieldValues[TName]
  isValuePresent: (value: TFieldValues[TName]) => boolean
  renderInput: (props: BaseFieldRenderProps<TFieldValues, TName>) => ReactNode
  variant?: FormFieldVariant
  withoutClearButton?: boolean
}

export const BaseField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  labelClassName,
  fieldClassName,
  disabled,
  required,
  defaultValue,
  rules,
  isValuePresent,
  renderInput,
  variant = FormFieldVariant.Standart,
  withoutClearButton = false,
}: BaseFieldProps<TFieldValues, TName>) => {
  const id = `field-${name}`
  const { control, setValue } = useFormContext<TFieldValues>()

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field, fieldState }) => {
        const errorMessage = fieldState.error?.message
        const hasValue = isValuePresent(field.value as TFieldValues[TName])
        const ariaDescribedBy = errorMessage ? `${id}-error` : undefined
        const inputClassName = clsx(
          'w-full font-medium rounded-md border p-input text-body border-[2px] transition-colors duration-300',
          fieldClassName,
          variant === FormFieldVariant.Filled && 'bg-input-primary',
          variant === FormFieldVariant.Outlined && 'bg-secondary',
          errorMessage
            ? 'border-error focus:border-error'
            : 'border-secondary focus:border-secondary',
        )
        const handleClear = () => {
          setValue(name, undefined as TFieldValues[TName], {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }

        return (
          <div className="relative flex w-full flex-col gap-1.5">
            <label className={clsx('font-inter font-medium', labelClassName)} htmlFor={id}>
              {label}
              {required && <span className="text-error"> *</span>}
            </label>
            <div className="relative">
              {renderInput({
                ariaDescribedBy,
                errorMessage,
                field,
                hasValue,
                id,
                inputClassName,
              })}
              {!withoutClearButton && (
                <ClearFieldButton disabled={disabled} hasValue={hasValue} onClear={handleClear} />
              )}
            </div>
            {errorMessage && (
              <span
                id={ariaDescribedBy}
                className="absolute left-0 top-full mt-0 sm:mt-1 text-[10px] sm:text-sm text-error"
                role="alert"
              >
                {errorMessage}
              </span>
            )}
          </div>
        )
      }}
    />
  )
}
