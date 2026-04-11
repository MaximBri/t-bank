import type { FieldValues } from 'react-hook-form'

import type {
  BaseFieldConfig,
  BooleanFieldConfig,
  DateFieldConfig,
  NumberFieldConfig,
  SelectFieldConfig,
  TextFieldConfig,
  FormFieldConfig,
} from './types.ts'

export const createFieldConfig = <TFieldValues extends FieldValues>(
  config: FormFieldConfig<TFieldValues>,
) => config

export const createTextField = <TFieldValues extends FieldValues>(
  config: TextFieldConfig<TFieldValues>,
) => config

export const createNumberField = <TFieldValues extends FieldValues>(
  config: NumberFieldConfig<TFieldValues>,
) => config

export const createSelectField = <TFieldValues extends FieldValues>(
  config: SelectFieldConfig<TFieldValues>,
) => config

export const createBooleanField = <TFieldValues extends FieldValues>(
  config: BooleanFieldConfig<TFieldValues>,
) => config

export const createDateField = <TFieldValues extends FieldValues>(
  config: DateFieldConfig<TFieldValues>,
) => config

export const createFields = <TFieldValues extends FieldValues>(
  configs: FormFieldConfig<TFieldValues>[],
) => configs

export const withRequired = <
  TFieldValues extends FieldValues,
  TFieldConfig extends BaseFieldConfig<TFieldValues>,
>(
  config: TFieldConfig,
): TFieldConfig => ({
  ...config,
  required: true,
})
