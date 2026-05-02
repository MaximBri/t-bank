const STUB_CHECK_URL = '/logo.svg'

export const fetchCheckImage = async (checkKey?: string): Promise<File> => {
  const response = await fetch(STUB_CHECK_URL)

  if (!response.ok) {
    throw new Error(`Failed to fetch check image: ${response.status}`)
  }

  const blob = await response.blob()

  return new File([blob], `${checkKey ?? 'stub-check'}.pdf`, {
    type: 'application/pdf',
  })
}
