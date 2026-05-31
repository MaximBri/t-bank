import { useState } from 'react'
import { useParams } from 'react-router-dom'
import SearchIcon from '@/shared/assets/icons/search.svg?react'

import { Text } from '@/shared/ui/text/Text.tsx'
import { TextInput } from '@/shared/ui/inputs'
import { HistoryRecordType } from '@/entities/historyRecord/model/type.ts'
import { HistoryRecordTypeTranslation } from '@/entities/historyRecord/model/constants.ts'
import { useGetEventHistory } from '@/entities/historyRecord/api/hooks/useGetEventHistory.ts'
import clsx from 'clsx'
import { parseServerDate } from '@/shared/lib/date/parse-server-date.ts'

const ACTION_TYPE_MAP: Record<string, HistoryRecordType> = {
  EXPENSE_CREATED: HistoryRecordType.ExpenseCreated,
  EXPENSE_UPDATED: HistoryRecordType.ExpenseUpdated,
  EXPENSE_DELETED: HistoryRecordType.ExpenseDeleted,
  EXPENSE_ACTIVATED: HistoryRecordType.ExpenseActivated,
  EXPENSE_REJECTED: HistoryRecordType.ExpenseRejected,
  SPLIT_CONFIRMED: HistoryRecordType.SplitConfirmed,
  PAYMENT_INITIATED: HistoryRecordType.PaymentInitiated,
  PAYMENT_CONFIRMED: HistoryRecordType.PaymentConfirmed,
  PAYMENT_SENT: HistoryRecordType.PaymentSent,
  PAYMENT_FAILED: HistoryRecordType.PaymentFailed,
  PAYMENT_COMPLETED: HistoryRecordType.PaymentCompleted,
  USER_KICKED: HistoryRecordType.UserRemoved,
  USER_LEFT: HistoryRecordType.UserLeft,
  USER_JOINED: HistoryRecordType.UserJoined,
  INVITATION_CREATED: HistoryRecordType.InvitationCreated,
  EVENT_CREATED: HistoryRecordType.EventCreated,
  EVENT_COMPLETED: HistoryRecordType.EventCompleted,
}

type FilterKey = 'all' | 'expenses' | 'participants' | 'events'

const FILTER_BUTTONS: { label: string; key: FilterKey }[] = [
  { label: 'Все', key: 'all' },
  { label: 'Расходы', key: 'expenses' },
  { label: 'Участники', key: 'participants' },
  { label: 'События', key: 'events' },
]

const FILTER_TYPES: Record<FilterKey, HistoryRecordType[] | null> = {
  all: null,
  expenses: [HistoryRecordType.ExpenseCreated, HistoryRecordType.ExpenseUpdated, HistoryRecordType.ExpenseDeleted, HistoryRecordType.ExpenseActivated, HistoryRecordType.ExpenseRejected, HistoryRecordType.SplitConfirmed, HistoryRecordType.PaymentInitiated, HistoryRecordType.PaymentConfirmed, HistoryRecordType.PaymentSent, HistoryRecordType.PaymentFailed, HistoryRecordType.PaymentCompleted],
  participants: [HistoryRecordType.UserJoined, HistoryRecordType.UserLeft, HistoryRecordType.UserRemoved, HistoryRecordType.InvitationCreated],
  events: [HistoryRecordType.EventCreated, HistoryRecordType.EventCompleted],
}

const formatDate = (isoString: string) => {
  try {
    const date = parseServerDate(isoString)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

export const EventHistoryWidget = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: records = [], isLoading } = useGetEventHistory(eventId)

  const filteredRecords = records.filter((record) => {
    const recordType = ACTION_TYPE_MAP[record.actionType]
    const allowedTypes = FILTER_TYPES[activeFilter]

    if (allowedTypes && (!recordType || !allowedTypes.includes(recordType))) {
      return false
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        record.message.toLowerCase().includes(q) ||
        record.userFullName.toLowerCase().includes(q)
      )
    }

    return true
  })

  return (
    <section className="flex flex-col gap-[15px] sm:gap-[20px]">
      <div>
        <Text as="h1" className="text-h2 sm:text-h1-d font-semibold">
          История событий
        </Text>
      </div>
      <div className="flex flex-col gap-[10px] sm:gap-[24px] bg-secondary p-[10px] sm:p-[24px] border-[2px] border-primary rounded-lg">
        <div className="flex flex-col gap-[10px] sm:gap-[16px]">
          <div className="flex flex-col sm:flex-row gap-[10px] sm:gap-[20px] justify-between">
            <div className="flex-1 sm:max-w-[660px]">
              <TextInput
                name="history-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=" text-body sm:text-h3-d h-[40px] sm:h-[56px] rounded-[10px] sm:rounded-md border border-primary pl-[67px] pr-[16px] text-primary placeholder:text-placeholder focus:border-primary"
                placeholder="Поиск по истории"
                icon={<SearchIcon width="24px" height="24px" className="text-placeholder" />}
                iconPosition="left"
              />
            </div>
            <div className="flex flex-wrap gap-[10px] sm:gap-[14px]">
              {FILTER_BUTTONS.map((button) => (
                <button
                  key={button.key}
                  onClick={() => setActiveFilter(button.key)}
                  className={clsx(
                    'border border-primary rounded-[10px] sm:rounded-md px-[10px] sm:px-[16px]',
                    button.key === activeFilter ? 'bg-yellow' : null,
                  )}
                >
                  <Text variant="h3" className="font-normal">
                    {button.label}
                  </Text>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Text className="text-h3-d sm:text-h2-d font-medium">
              Всего записей: {filteredRecords.length}
            </Text>
          </div>
        </div>
        <div className="flex flex-col gap-[10px] sm:gap-[24px]">
          {isLoading && (
            <Text className="text-h3-d text-placeholder">Загрузка...</Text>
          )}
          {!isLoading && filteredRecords.length === 0 && (
            <Text className="text-h3-d text-placeholder">Записей не найдено</Text>
          )}
          {filteredRecords.map((record) => {
            const recordType = ACTION_TYPE_MAP[record.actionType]
            const typeLabel = recordType ? HistoryRecordTypeTranslation[recordType] : record.actionType

            return (
              <div
                key={record.id}
                className="flex flex-col sm:flex-row sm:gap-[10px] items-start sm:justify-between"
              >
                <div>
                  <div className="flex gap-[16px] items-center justify-center">
                    <div className="w-[16px] h-[16px] shrink-0 bg-yellow rounded-full"></div>
                    <Text className="text-h3-d sm:text-h2-d font-medium">{record.message}</Text>
                  </div>
                  <Text variant="h3" className="sm:ml-[32px] text-placeholder">
                    {record.userFullName}
                  </Text>
                </div>
                <div className="text-end">
                  <Text className="hidden sm:text-h2-d sm:block font-medium">
                    {typeLabel}
                  </Text>
                  <Text variant="h3" className="text-placeholder">
                    {formatDate(record.createdAt)}
                  </Text>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
