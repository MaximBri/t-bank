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
  'name' | 'label' | 'placeholder' | 'disabled' | 'required' | 'rules'
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
          'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          errorMessage ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-slate-900',
          'pr-8',
        )

        return (
          <div className="flex w-full flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-900" htmlFor={id}>
              {label}
              {required ? ' *' : ''}
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
              <span id={ariaDescribedBy} className="text-sm text-red-600" role="alert">
                {errorMessage}
              </span>
            ) : null}
          </div>
        )
      }}
    />
  )
}
