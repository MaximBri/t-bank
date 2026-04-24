import type { FieldPath, FieldValues } from 'react-hook-form'
import { ParticipantsFieldConfig } from '@/features/CreateExpenseModal/model/types.ts'
import { BaseField } from '@/shared/ui/form-fields'
import { useState } from 'react'
import { Text } from '@/shared/ui/text/Text'
import ArrowIcon from '@/shared/assets/icons/arrow.svg?react'

import SearchIcon from '@/shared/assets/icons/search.svg?react'
import clsx from 'clsx'
import { FormFieldVariant } from '@/shared/lib/forms/types.ts'

type ParticipantsFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ParticipantsFieldConfig<TFieldValues, TName>, 'type'>

export const ParticipantsField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  participants,
  placeholder,
  fieldClassName,
  labelClassName,
  required,
  defaultValue,
  variant = FormFieldVariant.Filled,
}: ParticipantsFieldProps<TFieldValues, TName>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

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
      defaultValue={(defaultValue ?? []) as TFieldValues[TName]}
      isValuePresent={(value) => Array.isArray(value) && value.length > 0}
      renderInput={({ field, errorMessage, id, inputClassName }) => {
        const selectedValues = (Array.isArray(field.value) ? field.value : []) as Array<
          string | number
        >

        const filteredParticipants = participants.filter((participant) =>
          participant.fullName.toLowerCase().includes(searchValue.trim().toLowerCase()),
        )

        const selectedValueSet = new Set<string | number>(selectedValues)

        const allSelected = selectedValueSet.size === participants.length

        const handleToggleValue = (valueToToggle: number) => {
          const nextSelectedValues = selectedValueSet.has(valueToToggle)
            ? selectedValues.filter((item) => item !== valueToToggle)
            : [...selectedValues, valueToToggle]

          field.onChange(nextSelectedValues)
        }

        const handleToggleAll = () => {
          if (allSelected) {
            field.onChange([])
            return
          }
          field.onChange(participants.map((participant) => participant.id))
        }

        return (
          <div>
            <button
              id={id}
              type="button"
              onClick={() => {
                console.log('click')
                setIsOpen((prev) => !prev)
              }}
              className={clsx(
                'flex items-center justify-between gap-[16px]',
                selectedValues.length === 0 ? 'text-placeholder' : '',
                inputClassName,
              )}
              aria-invalid={errorMessage ? 'true' : 'false'}
              aria-describedby={errorMessage ? `${id}-error` : undefined}
              aria-expanded={isOpen}
            >
              <Text>
                {selectedValues.length === 0
                  ? placeholder
                  : `Выбрано участников (${selectedValues.length})`}
              </Text>
              <ArrowIcon
                width={20}
                height={20}
                className={clsx(isOpen ? '-rotate-90' : 'rotate-90')}
              />
            </button>

            {isOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-20 overflow-hidden rounded-md border-[2px] border-secondary bg-secondary">
                <div className="border-b-[2px] border-primary px-[16px] py-[10px]">
                  <div className="relative">
                    <SearchIcon
                      className="pointer-events-none absolute left-4 top-1/2 h-[24px] w-[24px] -translate-y-1/2 text-placeholder"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={searchValue}
                      placeholder="Поиск по участникам..."
                      onChange={(event) => setSearchValue(event.target.value)}
                      className={clsx(
                        'w-full px-[16px] h-[47px] border-[2px] border-primary rounded-md bg-input-primary pl-[50px]',
                      )}
                    />
                  </div>
                </div>

                <div className="max-h-[256px] overflow-y-auto px-[8px] py-[5px] ">
                  <label className="flex cursor-pointer items-center gap-[14px] border-b border-primary px-[8px] py-[10px]">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleToggleAll}
                      className="h-[20px] w-[20px] rounded bg-input-primary border-primary accent-yellow"
                    />
                    <Text variant="body" className="font-medium">
                      Выбрать всех ({participants.length})
                    </Text>
                  </label>

                  {filteredParticipants.length > 0 ? (
                    filteredParticipants.map((participant) => (
                      <label
                        key={String(participant.id)}
                        className={clsx(
                          'flex cursor-pointer items-center gap-[14px] px-[8px] py-[10px]',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedValueSet.has(participant.id)}
                          onChange={() => handleToggleValue(participant.id)}
                          className="h-[20px] w-[20px] rounded bg-input-primary border-primary accent-yellow"
                        />
                        <Text variant="body" className="font-medium">
                          {participant.fullName}
                        </Text>
                      </label>
                    ))
                  ) : (
                    <div className="px-[8px] py-[10px] text-placeholder">Ничего не найдено</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )
      }}
    ></BaseField>
  )
}
