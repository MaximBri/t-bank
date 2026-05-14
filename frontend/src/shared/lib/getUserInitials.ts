export const getUserInitials = (
  firstName?: string | null,
  lastName?: string | null,
  login?: string | null,
) => {
  const first = firstName?.[0] ?? ''
  const last = lastName?.[0] ?? ''

  if (first || last) {
    return `${first ? first + '.' : ''}${last ? last + '.' : ''}`.toUpperCase()
  }

  return (login?.[0] ?? '').toUpperCase()
}
