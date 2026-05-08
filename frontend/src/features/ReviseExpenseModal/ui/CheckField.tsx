import clsx from 'clsx'
import { type ChangeEvent, useRef } from 'react'
import FileIcon from '@/shared/assets/icons/file.svg?react'

import { type FieldPath, type FieldValues } from 'react-hook-form'
import { formatFileSize } from '@/shared/lib/file/formatFileSize.ts'
import { Text } from '@/shared/ui/text/Text'
import { ReviseFieldConfig } from '@/features/ReviseExpenseModal/model/types.ts'
import { BaseField } from '@/shared/ui/form-fields'
import { FormFieldVariant } from '@/shared/lib/forms/types.ts'

type CheckFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ReviseFieldConfig<TFieldValues, TName>, 'type'>

export const CheckField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  required,
  placeholder,
  accept,
  labelClassName,
  fieldClassName,
  defaultValue,
  variant = FormFieldVariant.Filled,
}: CheckFieldProps<TFieldValues, TName>) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <BaseField
      name={name}
      label={label}
      labelClassName={labelClassName}
      fieldClassName={fieldClassName}
      withoutClearButton={true}
      placeholder={placeholder}
      required={required}
      variant={variant}
      defaultValue={defaultValue as TFieldValues[TName]}
      isValuePresent={(value) => (value as unknown) instanceof File}
      renderInput={({ field, errorMessage, id, inputClassName }) => {
        const currentFile = field.value as File
        const ariaDescribedBy = errorMessage ? `${id}-error` : undefined

        const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
          const nextFile = event.target.files?.[0]

          if (!nextFile) {
            return
          }

          field.onChange(nextFile)
        }

        return (
          <div className="relative flex w-full flex-col gap-[10px]">
            <input
              ref={(element) => {
                inputRef.current = element
                field.ref(element)
              }}
              id={id}
              name={field.name}
              type="file"
              accept={accept}
              className="sr-only"
              onBlur={field.onBlur}
              onChange={handleFileChange}
              aria-invalid={errorMessage ? 'true' : 'false'}
              aria-describedby={ariaDescribedBy}
            />

            <div
              className={clsx(
                'flex flex-col sm:flex-row w-full sm:items-center sm:gap-[12px] rounded-md',
                inputClassName,
                errorMessage ? 'border-error' : 'border-secondary',
              )}
            >
              <div className="flex min-w-0 flex-1 items-start sm:items-center gap-[12px]">
                <FileIcon className="h-[36px] w-[36px] sm:h-[40px] sm:w-[40px]" />
                <div className="min-w-0">
                  <Text className="truncate text-body font-medium">{currentFile.name}</Text>
                  <Text className="text-small">{formatFileSize(currentFile.size)}</Text>
                </div>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="ml-auto sm:ml-0 w-fit sm:w-auto shrink-0 border-[2px] rounded-md border-primary bg-primary px-[20px] py-[4px] text-body font-medium"
              >
                Заменить
              </button>
            </div>
          </div>
        )
      }}
    ></BaseField>
  )
}
