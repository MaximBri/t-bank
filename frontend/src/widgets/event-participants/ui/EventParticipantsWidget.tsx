import { useState } from 'react'
import { useParams } from 'react-router-dom'
import clsx from 'clsx'

import SearchIcon from '@/shared/assets/icons/search.svg?react'
import CheckIcon from '@/shared/assets/icons/check.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import UserMinusIcon from '@/shared/assets/icons/user-minus.svg?react'
import UserPlusIcon from '@/shared/assets/icons/user-plus.svg?react'

import { TextInput } from '@/shared/ui/inputs'
import { Text } from '@/shared/ui/text/Text.tsx'
import { Button } from '@/shared/ui/button/Button.tsx'
import { ButtonEnum } from '@/shared/ui/button/constants.ts'
import { UserAvatar } from '@/shared/ui/userAvatar/UserAvatar.tsx'
import { UserAvatarSizes } from '@/shared/ui/userAvatar/constants.ts'

import {
  EventParticipantStatus,
  ParticipantRowKind,
  ParticipantsFilter,
} from '@/widgets/event-participants/model/types.ts'
import {
  participantStatusClasses,
  participantStatusLabel,
  participantsFilterButtons,
} from '@/widgets/event-participants/model/constants.ts'
import { useEventParticipantsRows } from '@/widgets/event-participants/lib/useEventParticipantsRows.ts'
import { InviteParticipantsModal } from '@/features/InviteParticipantsModal/ui/InviteParticipantsModal.tsx'

import { useDecideInvitation } from '@/entities/invitation/api/hooks/useDecideInvitation.ts'
import { InvitationStatus } from '@/entities/invitation'

export const EventParticipantsWidget = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const [activeFilter, setActiveFilter] = useState<ParticipantsFilter>(ParticipantsFilter.All)
  const [searchQuery, setSearchQuery] = useState('')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const { participantsCount, visibleRows } = useEventParticipantsRows({
    eventId,
    filter: activeFilter,
    searchQuery,
  })
  const { mutate: decideInvitation, isPending: isDeciding } = useDecideInvitation()

  return (
    <>
      <section className="flex flex-col gap-[15px] sm:gap-[20px]">
        <div>
          <Text as="h1" className="text-h2 sm:text-h1-d font-semibold">
            Участники
          </Text>
        </div>

        <div className="flex flex-col gap-[10px] rounded-lg border-[2px] border-primary bg-secondary p-[10px] sm:gap-[24px] sm:p-[24px]">
          <div className="flex flex-col gap-[10px] sm:gap-[16px]">
            <div className="flex flex-col justify-between gap-[10px] sm:flex-row sm:gap-[20px]">
              <div className="flex-1 sm:max-w-[660px]">
                <TextInput
                  name="participants-search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-[40px] rounded-[10px] border border-primary pl-[67px] pr-[16px] text-body text-primary placeholder:text-placeholder focus:border-primary sm:h-[56px] sm:rounded-md sm:text-h3-d"
                  placeholder="Поиск по участникам"
                  icon={<SearchIcon width="24px" height="24px" className="text-placeholder" />}
                  iconPosition="left"
                />
              </div>

              <div className="flex flex-wrap gap-[10px] sm:gap-[14px]">
                {participantsFilterButtons.map((button) => (
                  <button
                    key={button.key}
                    type="button"
                    onClick={() => setActiveFilter(button.key)}
                    className={clsx(
                      'rounded-[10px] border border-primary px-[10px] sm:rounded-md sm:px-[16px] sm:py-[10px]',
                      button.key === activeFilter && 'bg-yellow',
                    )}
                  >
                    <Text variant="h3" className="font-normal">
                      {button.label}
                    </Text>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-[10px] sm:flex-row sm:items-center sm:justify-between">
              <Text className="text-h3-d font-medium sm:text-h2-d">
                Всего участников: {participantsCount}
              </Text>

              <Button
                variant={ButtonEnum.Primary}
                className="ml-auto w-fit"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <UserPlusIcon className="h-[20px] w-[20px] sm:h-[24px] sm:w-[24px]" />
                <Text variant="h3" className="font-normal">
                  Пригласить участников
                </Text>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-[24px]">
            {visibleRows.map((row) => {
              const status =
                row.kind === ParticipantRowKind.Pending
                  ? EventParticipantStatus.pending
                  : row.status
              const displayName =
                row.kind === ParticipantRowKind.Participant && (row.firstName || row.lastName)
                  ? `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim()
                  : row.login

              return (
                <div
                  key={row.key}
                  className="flex gap-[14px] sm:flex-row sm:items-center sm:gap-[24px]"
                >
                  <UserAvatar
                    firstName={row.kind === ParticipantRowKind.Participant ? row.firstName : null}
                    lastName={row.kind === ParticipantRowKind.Participant ? row.lastName : null}
                    login={row.login}
                    variant={UserAvatarSizes.L}
                  />
                  <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                    <div className="min-w-0 max-w-[200px] sm:max-w-[400px]">
                      <Text as="p" className="truncate text-h3-d font-medium sm:text-h2-d">
                        {displayName}
                      </Text>
                      <Text as="p" className="truncate text-body text-muted sm:text-h3-d">
                        {row.login}
                      </Text>
                    </div>

                    <div className="flex gap-[8px] sm:gap-[10px]">
                      <div
                        className={clsx(
                          'inline-flex items-center rounded-lg px-[12px] font-medium sm:min-h-[44px]',
                          participantStatusClasses[status],
                        )}
                      >
                        <Text as="span" variant="h3">
                          {participantStatusLabel[status]}
                        </Text>
                      </div>

                      {row.kind === ParticipantRowKind.Pending ? (
                        <>
                          <button
                            type="button"
                            disabled={isDeciding}
                            onClick={() =>
                              decideInvitation({
                                invitationId: row.invitationId,
                                payload: { status: InvitationStatus.Accepted },
                              })
                            }
                            className="flex items-center rounded-md border border-green bg-green-light px-[8px] disabled:opacity-60 sm:px-[12px] sm:py-[10px]"
                            aria-label="Принять заявку"
                          >
                            <CheckIcon className="h-[16px] w-[16px] sm:h-[24px] sm:w-[24px]" />
                          </button>
                          <button
                            type="button"
                            disabled={isDeciding}
                            onClick={() =>
                              decideInvitation({
                                invitationId: row.invitationId,
                                payload: { status: InvitationStatus.Rejected },
                              })
                            }
                            className="flex items-center rounded-md border border-primary px-[8px] disabled:opacity-60 sm:px-[12px] sm:py-[10px]"
                            aria-label="Отклонить заявку"
                          >
                            <CloseIcon className="h-[16px] w-[16px] sm:h-[24px] sm:w-[24px]" />
                          </button>
                        </>
                      ) : row.status !== EventParticipantStatus.owner ? (
                        <button
                          type="button"
                          className="flex items-center rounded-md border border-primary px-[8px] sm:px-[12px] sm:py-[10px]"
                          aria-label="Исключить участника"
                        >
                          <UserMinusIcon className="h-[16px] w-[16px] sm:h-[24px] sm:w-[24px]" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <InviteParticipantsModal
        eventId={eventId}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </>
  )
}
