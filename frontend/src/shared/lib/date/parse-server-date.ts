const timezonePattern = /(Z|[+-]\d{2}:\d{2})$/i

export const parseServerDate = (value: string): Date => {
  const normalizedValue = timezonePattern.test(value) ? value : `${value}Z`
  return new Date(normalizedValue)
}
