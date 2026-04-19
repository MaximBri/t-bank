import { useState } from 'react'
import { useWatch, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'

import { defaultExpenseCategories } from '../model/constants'
import type { ExpenseCategoryList } from '../model/types'

type ExpenseCategoriesFormValues = FieldValues & {
  categories: ExpenseCategoryList
}

type UseExpenseCategoriesParams<TFormValues extends ExpenseCategoriesFormValues> = Pick<
  UseFormReturn<TFormValues>,
  'clearErrors' | 'control' | 'getValues' | 'setError' | 'setValue'
>

export const useExpenseCategories = <TFormValues extends ExpenseCategoriesFormValues>({
  control,
  getValues,
  setError,
  setValue,
}: UseExpenseCategoriesParams<TFormValues>) => {
  const [categoryInput, setCategoryInput] = useState('')
  const categoriesFieldName = 'categories' as Path<TFormValues>
  const categories = useWatch({
    control,
    name: categoriesFieldName,
    defaultValue: defaultExpenseCategories as TFormValues[Path<TFormValues>],
  }) as ExpenseCategoryList

  const resetCategories = () => {
    setCategoryInput('')
  }

  const addCategory = () => {
    const trimmedValue = categoryInput.trim()
    const currentCategories = getValues(categoriesFieldName) as ExpenseCategoryList

    if (trimmedValue === undefined || trimmedValue === '') {
      return;
    }

    if (currentCategories.includes(trimmedValue)) {
      setError(categoriesFieldName, {
        message: 'Категории не должны повторяться',
      })
      return
    }

    setValue(categoriesFieldName, [...currentCategories, trimmedValue] as TFormValues[Path<TFormValues>], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    setCategoryInput('')
  }

  const removeCategory = (categoryToRemove: string) => {
    const currentCategories = getValues(categoriesFieldName) as ExpenseCategoryList

    setValue(
      categoriesFieldName,
      currentCategories.filter((category) => category !== categoryToRemove) as TFormValues[Path<TFormValues>],
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
