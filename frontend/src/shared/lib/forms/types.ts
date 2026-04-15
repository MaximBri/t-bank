import type { FieldPath, FieldValues, RegisterOptions } from 'react-hook-form'
import type { ZodTypeAny } from 'zod'

export type FormSchema = ZodTypeAny

export type FormOption = {
  label: string
  value: string | number
  disabled?: boolean
}

export type BaseFieldType = 'text' | 'number' | 'email' | 'password' | 'checkbox' | 'select'

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
}

export type FormFieldConfig<TFieldValues extends FieldValues = FieldValues> =
  | TextFieldConfig<TFieldValues>
  | NumberFieldConfig<TFieldValues>
  | BooleanFieldConfig<TFieldValues>
  | DateFieldConfig<TFieldValues>
  | SelectFieldConfig<TFieldValues>
