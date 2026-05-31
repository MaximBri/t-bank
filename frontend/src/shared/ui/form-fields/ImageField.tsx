import clsx from 'clsx'
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import {
  Controller,
  useFormContext,
  useWatch,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import ImageFilledIcon from '@/shared/assets/icons/image-filled.svg?react'
import FileIcon from '@/shared/assets/icons/file.svg?react'

import type { ImageFieldConfig } from '@/shared/lib/forms'
import { MAX_UPLOAD_FILE_SIZE_BYTES, maxUploadFileSizeErrorMessage } from '@/shared/config/upload'

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
  hidePreviewFrame,
}: ImageFieldProps<TFieldValues, TName>) => {
  const generatedId = useId()
  const id = `field-${generatedId}`
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { control } = useFormContext<TFieldValues>()
  const currentValue = useWatch({
    control,
    name,
  }) as unknown

  useEffect(() => {
    if (!(currentValue instanceof File)) {
      setPreviewUrl((currentPreviewUrl) => {
        if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl)
        }

        return null
      })

      if (inputRef.current) {
        inputRef.current.value = ''
      }

      return
    }

    if (!currentValue.type.startsWith('image/')) {
      setPreviewUrl((currentPreviewUrl) => {
        if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl)
        }
        return null
      })
      return
    }

    const nextPreviewUrl = URL.createObjectURL(currentValue)

    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl)
      }

      return nextPreviewUrl
    })

    return () => {
      URL.revokeObjectURL(nextPreviewUrl)
    }
  }, [currentValue])

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
        const isImageFile = !!currentFile?.type.startsWith('image/')
        const ariaDescribedBy = errorMessage ? `${id}-error` : undefined

        const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
          const nextFile = event.target.files?.[0]

          if (!nextFile) {
            return
          }

          if (nextFile.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
            toast.error(maxUploadFileSizeErrorMessage)
            event.target.value = ''
            return
          }

          field.onChange(nextFile)
        }

        return (
          <div className="relative flex w-full flex-col gap-1.5">
            <label className={clsx('font-inter font-medium', labelClassName)} htmlFor={id}>
              {label}
              {required ? <span className="text-error"> *</span> : ''}
            </label>

            <div className="relative h-full">
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

              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className={clsx(
                  fieldClassName,
                  'flex rounded-md w-full items-center justify-center overflow-hidden',
                  hidePreviewFrame && previewUrl ? '' : 'bg-input-primary border-2',
                  errorMessage
                    ? 'border-2 border-error'
                    : hidePreviewFrame && previewUrl
                      ? ''
                      : 'border-secondary',
                )}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={currentFile?.name ?? 'Предпросмотр изображения'}
                    className={clsx('h-full w-full object-cover', previewClassName)}
                  />
                ) : currentFile && !isImageFile ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-[8px]">
                    <FileIcon className="h-[44px] w-[44px] text-placeholder" />
                    <span className="max-w-[90%] truncate text-small text-placeholder">
                      {currentFile.name}
                    </span>
                  </div>
                ) : (
                  <ImageFilledIcon className="h-[55px] w-[55px] text-placeholder" />
                )}
              </button>
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
