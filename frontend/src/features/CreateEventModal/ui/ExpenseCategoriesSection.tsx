import type { KeyboardEvent } from 'react'

import AddIcon from '@/shared/assets/icons/add.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import { Button } from '@/shared/ui/button/Button.tsx'
import { TextInput } from '@/shared/ui/inputs'
import { Text } from '@/shared/ui/text/Text'

type ExpenseCategoriesSectionProps = {
  categories: string[]
  categoryInput: string
  errorMessage?: string
  onAddCategory: () => void
  onCategoryInputChange: (value: string) => void
  onRemoveCategory: (category: string) => void
}

export const ExpenseCategoriesSection = ({
  categories,
  categoryInput,
  errorMessage,
  onAddCategory,
  onCategoryInputChange,
  onRemoveCategory,
}: ExpenseCategoriesSectionProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return

    event.preventDefault()
    onAddCategory()
  }

  return (
    <div className="flex flex-col gap-[10px]">
      <Text as="h3" variant="h3">
        Категории расходов
      </Text>
      {!!categories.length && (
        <div className="flex flex-wrap gap-[5px] sm:gap-[15px]">
          {categories.map((category) => (
            <span
              key={category}
              className="bg-yellow flex flex-row items-center justify-center gap-[15px] px-[10px] py-[1px] text-h3 sm:px-[17px] sm:py-[5px] h-[37px] rounded-[24px]"
              onClick={() => onRemoveCategory(category)}
            >
              {category}
              <CloseIcon width={14} height={14} />
            </span>
          ))}
        </div>
      )}

      <div className="relative flex flex-col gap-[15px] sm:flex-row sm:gap-[15px]">
        <div className="flex-1">
          <TextInput
            value={categoryInput}
            onChange={(event) => onCategoryInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Добавить категорию..."
            className="rounded-md border border-primary bg-primary px-[16px] py-[10px] text-h3 text-primary placeholder:text-placeholder"
          />
        </div>
        <Button
          type="button"
          className="w-[125px] mt-[10px] justify-self-end gap-[10px] px-[15px] py-[4px] sm:mt-0 sm:w-auto sm:px-[30px] sm:py-[10px]"
          onClick={onAddCategory}
        >
          <AddIcon className="h-[16px] w-[16px] text-h3" />
          Добавить
        </Button>
        {errorMessage ? (
          <p className="absolute bottom-auto top-[48%] sm:top-auto sm:-bottom-[25px] text-[10px] text-error sm:text-sm">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <p className="text-small font-medium text-primary sm:text-h3">
        Категории помогут организовать учёт расходов по направлениям
      </p>
    </div>
  )
}
