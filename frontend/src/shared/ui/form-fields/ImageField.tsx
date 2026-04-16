import clsx from 'clsx'
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import ImageFilledIcon from '@/shared/assets/icons/image-filled.svg?react'

import type { ImageFieldConfig } from '@/shared/lib/forms'
import {Button} from "@/shared/ui/button/Button.tsx";

type ImageFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ImageFieldConfig<TFieldValues, TName>, 'type'>

export const ImageField = <
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
  accept = 'image/*',
  previewClassName,
}: ImageFieldProps<TFieldValues, TName>) => {
  const generatedId = useId()
  const id = `field-${generatedId}`
  const inputRef =  useRef<HTMLInputElement | null>(null)
  const [ previewUrl, setPreviewUrl ] = useState<string | null>(null)
  const { control } = useFormContext<TFieldValues>()

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={(defaultValue ?? undefined) as TFieldValues[TName]}
      rules={rules}
      render={({ field, fieldState }) => {
        const errorMessage = fieldState.error?.message
        const rawValue = field.value as unknown
        const currentFile = rawValue instanceof File ? rawValue : null
        const ariaDescribedBy = errorMessage ? `${id}-error` : undefined

        const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
          const nextFile = event.target.files?.[0]

          if (!nextFile) {
            return
          }

          if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
          }

          setPreviewUrl(URL.createObjectURL(nextFile))
          field.onChange(nextFile)
        }

        return (
          <div className="flex w-full flex-col gap-1.5 sm:w-auto">
            <label className={clsx('font-inter font-medium', labelClassName)} htmlFor={id}>
              {label}
              {required ? <span className="text-error"> *</span> : ''}
            </label>

            <div className="relative">
              <input
                ref={(element) => {
                  inputRef.current = element
                  field.ref(element)
                }}
                id={id}
                name={field.name}
                type="file"
                accept={accept}
                disabled={disabled}
                className="sr-only"
                onChange={handleFileChange}
                onBlur={field.onBlur}
                aria-invalid={errorMessage ? 'true' : 'false'}
                aria-describedby={ariaDescribedBy}
              />

              <Button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className={clsx(
                  'flex h-[150px] w-full items-center justify-center overflow-hidden sm:w-[150px]',
                  fieldClassName,
                )}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={currentFile?.name ?? 'Предпросмотр изображения'}
                    className={clsx('h-full w-full object-cover', previewClassName)}
                  />
                ) : <ImageFilledIcon className="h-[55px] w-[55px]" />}
              </Button>

            </div>

            {errorMessage ? (
              <span
                id={ariaDescribedBy}
                className="absolute left-0 top-full sm:mt-1 text-small text-error sm:text-sm"
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
