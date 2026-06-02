export const parseNumberValue = (value: unknown) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }
  const normalizedValue =
    typeof value === 'string' ? value.trim().replace(',', '.') : value
  if (normalizedValue === '') {
    return undefined
  }
  const parsedValue = Number(normalizedValue)
  return Number.isNaN(parsedValue) ? undefined : parsedValue
}
