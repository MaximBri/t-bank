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
  'name' | 'label' | 'labelClassName' | 'fieldClassName' | 'placeholder' | 'disabled' | 'required' | 'rules'
> & {
  defaultValue: TFieldValues[TName]
  isValuePresent: (value: TFieldValues[TName]) => boolean
  renderInput: (props: BaseFieldRenderProps<TFieldValues, TName>) => ReactNode
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
          'w-full placeholder:text-placeholder disabled:cursor-not-allowed',
          errorMessage
            ? 'border-red-500 focus:border-red-500'
            : 'border-slate-300 focus:border-slate-900',
          'pr-8',
          fieldClassName,
        )

        return (
          <div className="relative flex w-full flex-col gap-1.5">
            <label
              className={clsx('font-inter font-medium', labelClassName)}
              htmlFor={id}
            >
              {label}
                {required ? <span className="text-error"> *</span> : ''}
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

              <ClearFieldButton
                disabled={disabled}
                hasValue={hasValue}
                onClear={() =>
                  setValue(name, undefined as TFieldValues[TName], {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
              />
            </div>

            {errorMessage ? (
              <span
                id={ariaDescribedBy}
                className="absolute left-0 top-full mt-0 sm:mt-1 text-[10px] sm:text-sm text-error"
                role="alert"
              >
                {errorMessage}
              </span>
            ) : null}
          </div>
        )
      }}
    />
  )
}
