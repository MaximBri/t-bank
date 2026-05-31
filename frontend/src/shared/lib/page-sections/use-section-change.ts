import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'

type UseSectionChangeParams<TSection> = {
  queryKey?: string
  defaultSection: TSection
  sections: TSection[]
}

export const useSectionChange = <TSection>({
  queryKey = 'section',
  defaultSection,
  sections,
}: UseSectionChangeParams<TSection>) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const sectionFromQuery = searchParams.get(queryKey)

  const isValidSection = (value: string | null): boolean => {
    return value !== null && sections.includes(value as TSection)
  }

  const handleSectionChange = (section: TSection) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(queryKey, section as string)
    setSearchParams(nextParams)
  }

  const activeSection = isValidSection(sectionFromQuery)
    ? (sectionFromQuery as TSection)
    : defaultSection

  useEffect(() => {
    if (isValidSection(sectionFromQuery)) {
      return
    }
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(queryKey, defaultSection as string)
    setSearchParams(nextParams, { replace: true })
  }, [defaultSection, sectionFromQuery])

  return {
    activeSection,
    handleSectionChange,
  }
}
