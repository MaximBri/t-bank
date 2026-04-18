import type { KeyboardEvent } from 'react'

import AddIcon from '@/shared/assets/icons/add.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import { Button } from '@/shared/ui/button/Button.tsx'
import { TextInput } from '@/shared/ui/inputs'

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
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    onAddCategory()
  }

  return (
    <div className="flex flex-col gap-[10px]">
      <p className="text-h3-d font-medium text-primary">Категории расходов</p>
      { categories.length !== 0 ?  <div className="flex flex-wrap gap-[5px] sm:gap-[15px]">
        {categories.map((category) => (
          <Button
            key={category}
            type="button"
            className="inline-flex items-center gap-[15px] rounded-[24px] bg-yellow px-[10px] py-[1px] text-h3 font-medium text-primary sm:px-[17px] sm:py-[5px]"
            onClick={() => onRemoveCategory(category)}
          >
            <span>{category}</span>
            <CloseIcon width="14px" height="14px" />
          </Button>
        ))}
      </div> : null}

      <div className="relative flex flex-col gap-[15px] sm:flex-row sm:gap-[15px]">
        <div className="flex-1">
          <TextInput
            value={categoryInput}
            onChange={(event) => onCategoryInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Добавить категорию..."
            className="rounded-[16px] border border-primary bg-primary px-[16px] py-[10px] text-h3 text-primary placeholder:text-placeholder"
          />
        </div>
        <Button
          type="button"
          className="w-[125px] mt-[10px] justify-self-end gap-[10px] rounded-[16px] bg-yellow px-[15px] py-[4px] text-h3 font-medium text-primary sm:mt-0 sm:w-auto sm:px-[30px] sm:py-[10px]"
          onClick={onAddCategory}
        >
          <AddIcon className="h-[16px] w-[16px] text-h3" />
          Добавить
        </Button>
        {errorMessage ? <p className="absolute bottom-auto top-[48%] sm:top-auto sm:-bottom-[25px] text-[10px] text-error sm:text-sm">{errorMessage}</p> : null}
      </div>


      <p className="text-small font-medium text-primary sm:text-h3">
        Категории помогут организовать учёт расходов по направлениям
      </p>


    </div>
  )
}
