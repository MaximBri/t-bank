export function formatDateRange(start: string, end?: string): string {
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ]

  const parse = (value: string) => {
    const [year, month, day] = value.split('-').map(Number)
    return { year, month, day }
  }

  const s = parse(start)

  if (!end) {
    return `С ${s.day} ${months[s.month - 1]} ${s.year}`
  }

  const e = parse(end)

  if (s.year === e.year && s.month === e.month) {
    return `${s.day} - ${e.day} ${months[e.month - 1]} ${e.year}`
  }

  if (s.year === e.year) {
    return `${s.day} ${months[s.month - 1]} - ${e.day} ${months[e.month - 1]} ${e.year}`
  }

  return `${s.day} ${months[s.month - 1]} ${s.year} - ${e.day} ${months[e.month - 1]} ${e.year}`
}
