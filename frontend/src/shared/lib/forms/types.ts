import type { ReactNode } from 'react'
import type { FieldPath, FieldValues, RegisterOptions } from 'react-hook-form'
import type { ZodTypeAny } from 'zod'

export type FormSchema = ZodTypeAny

export type FormOption = {
  label: string
  value: string | number
  disabled?: boolean
}

export type BaseFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'password'
  | 'checkbox'
  | 'select'
  | 'date'
  | 'image'

export type BaseFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
  type: BaseFieldType
  label: string
  labelClassName?: string
  fieldClassName?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  defaultValue?: unknown
  rules?: RegisterOptions<TFieldValues, TName>
}

export type TextFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldConfig<TFieldValues, TName> & {
  type: 'text' | 'email' | 'password'
}

export type TextAreaFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldConfig<TFieldValues, TName> & {
  type: 'textarea'
  rows?: number
}

export type NumberFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldConfig<TFieldValues, TName> & {
  type: 'number'
  min?: number
  max?: number
  step?: number
}

export type SelectFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldConfig<TFieldValues, TName> & {
  type: 'select'
  options: FormOption[]
}

export type BooleanFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldConfig<TFieldValues, TName> & {
  type: 'checkbox'
}

export type DateFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldConfig<TFieldValues, TName> & {
  type: 'date'
  minDate?: string
  maxDate?: string
  calendarIconSize?: string
}

export type ImageFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldConfig<TFieldValues, TName> & {
  type: 'image'
  accept?: string
  emptyState?: ReactNode
  previewClassName?: string
}

export type FormFieldConfig<TFieldValues extends FieldValues = FieldValues> =
  | TextFieldConfig<TFieldValues>
  | TextAreaFieldConfig<TFieldValues>
  | NumberFieldConfig<TFieldValues>
  | BooleanFieldConfig<TFieldValues>
  | DateFieldConfig<TFieldValues>
  | ImageFieldConfig<TFieldValues>
  | SelectFieldConfig<TFieldValues>
