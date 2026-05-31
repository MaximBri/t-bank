import { parseServerDate } from '@/shared/lib/date/parse-server-date'

export const formatNotificationDate = (iso: string) => {
  const date = parseServerDate(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
