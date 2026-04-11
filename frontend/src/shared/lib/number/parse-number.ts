export const parseNumberValue = (value: unknown) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }
  const parsedValue = Number(value)
  return Number.isNaN(parsedValue) ? undefined : parsedValue
}
