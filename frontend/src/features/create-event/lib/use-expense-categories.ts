import { useState } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'

import type { CreateEventFormValues } from '../model/types.ts'
import { defaultExpenseCategories } from "../model/constants.ts";

type UseExpenseCategoriesParams = Pick<
  UseFormReturn<CreateEventFormValues>,
  'control' | 'getValues' | 'setValue'
>

export const useExpenseCategories = ({ control, getValues, setValue }: UseExpenseCategoriesParams) => {
  const [categoryInput, setCategoryInput] = useState('')
  const categories = useWatch({
    control,
    name: 'categories',
    defaultValue: defaultExpenseCategories,
  })

  const resetCategories = () => {
    setCategoryInput('')
  }

  const addCategory = () => {
    const trimmedValue = categoryInput.trim()
    const currentCategories = getValues('categories')

    if (!trimmedValue || currentCategories.includes(trimmedValue)) {
      return
    }

    setValue('categories', [...currentCategories, trimmedValue], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    setCategoryInput('')
  }

  const removeCategory = (categoryToRemove: string) => {
    const currentCategories = getValues('categories')

    setValue(
      'categories',
      currentCategories.filter((category) => category !== categoryToRemove),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    )
  }

  return {
    addCategory,
    categories,
    categoryInput,
    removeCategory,
    resetCategories,
    setCategoryInput,
  }
}
