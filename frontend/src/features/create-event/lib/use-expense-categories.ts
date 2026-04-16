import { useState } from 'react'

import { defaultExpenseCategories } from '../ui/create-event.constants.ts'

export const useExpenseCategories = () => {
  const [categoryInput, setCategoryInput] = useState('')
  const [categories, setCategories] = useState(defaultExpenseCategories)

  const resetCategories = () => {
    setCategoryInput('')
    setCategories(defaultExpenseCategories)
  }

  const addCategory = () => {
    const trimmedValue = categoryInput.trim()

    if (!trimmedValue || categories.includes(trimmedValue)) {
      return
    }

    setCategories((current) => [...current, trimmedValue])
    setCategoryInput('')
  }

  const removeCategory = (categoryToRemove: string) => {
    setCategories((current) => current.filter((category) => category !== categoryToRemove))
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
