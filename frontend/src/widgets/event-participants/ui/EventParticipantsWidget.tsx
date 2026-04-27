import { useState } from 'react'
import clsx from 'clsx'

import SearchIcon from '@/shared/assets/icons/search.svg?react'
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
  EventParticipant,
  EventParticipantStatus,
} from '@/widgets/event-participants/model/types.ts'
import {
  participantStatusClasses,
  participantStatusLabel,
} from '@/widgets/event-participants/model/constants.ts'
import { InviteParticipantsModal } from '@/features/InviteParticipantsModal/ui/InviteParticipantsModal.tsx'

const eventParticipants: EventParticipant[] = [
  {
    id: 1,
    firstName: 'Мария',
    lastName: 'Сидорова',
    email: 'ivan@email.com',
    status: EventParticipantStatus.owner,
  },
  {
    id: 2,
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan@email.com',
    status: EventParticipantStatus.participant,
  },
  {
    id: 3,
    firstName: 'Мария',
    lastName: 'Сидорова',
    email: 'maria.aria@email.com',
    status: EventParticipantStatus.participant,
  },
  {
    id: 4,
    firstName: 'Дмитрий',
    lastName: 'Васильев',
    email: 'dmitri.vas@gmail.com',
    status: EventParticipantStatus.invited,
  },
]

export const EventParticipantsWidget = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const filterButtons = ['Все', 'Приняли приглашение', 'Приглашённые']

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
                  name="history-search"
                  className="h-[40px] rounded-[10px] border border-primary pl-[67px] pr-[16px] text-body text-primary placeholder:text-placeholder focus:border-primary sm:h-[56px] sm:rounded-md sm:text-h3-d"
                  placeholder="Поиск по участникам"
                  icon={<SearchIcon width="24px" height="24px" className="text-placeholder" />}
                  iconPosition="left"
                />
              </div>

              <div className="flex flex-wrap gap-[10px] sm:gap-[14px]">
                {filterButtons.map((button, index) => (
                  <button
                    key={button}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={clsx(
                      'rounded-[10px] border border-primary px-[10px] sm:rounded-md sm:px-[16px] sm:py-[10px]',
                      index === activeIndex && 'bg-yellow',
                    )}
                  >
                    <Text variant="h3" className="font-normal">
                      {button}
                    </Text>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-[10px] sm:flex-row sm:items-center sm:justify-between">
              <Text className="text-h3-d font-medium sm:text-h2-d">
                Всего участников: {eventParticipants.length}
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
            {eventParticipants.map((participant) => {
              const isOwner = participant.status === EventParticipantStatus.owner
              const isInvited = participant.status === EventParticipantStatus.invited

              return (
                <div
                  key={participant.id}
                  className="flex gap-[14px] sm:flex-row sm:items-center sm:gap-[24px]"
                >
                  <UserAvatar
                    firstName={participant.firstName}
                    lastName={participant.lastName}
                    email={participant.email}
                    variant={UserAvatarSizes.L}
                  />
                  <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                    <div className="min-w-0 max-w-[200px] sm:max-w-[400px]">
                      <Text as="p" className="truncate text-h3-d font-medium sm:text-h2-d">
                        {participant.firstName} {participant.lastName}
                      </Text>
                      <Text as="p" className="truncate text-body text-muted sm:text-h3-d">
                        {participant.email}
                      </Text>
                    </div>

                    <div className="flex gap-[8px] sm:gap-[10px]">
                      <div
                        className={clsx(
                          'inline-flex items-center rounded-lg px-[12px] font-medium sm:min-h-[44px]',
                          participantStatusClasses[participant.status],
                        )}
                      >
                        <Text as="span" variant="h3">
                          {participantStatusLabel[participant.status]}
                        </Text>
                      </div>

                      {!isOwner ? (
                        <button
                          type="button"
                          className="flex items-center rounded-md border border-primary px-[8px] sm:px-[12px] sm:py-[10px]"
                          aria-label={isInvited ? 'Отменить приглашение' : 'Исключить участника'}
                        >
                          {isInvited ? (
                            <CloseIcon className="h-[16px] w-[16px] sm:h-[24px] sm:w-[24px]" />
                          ) : (
                            <UserMinusIcon className="h-[16px] w-[16px] sm:h-[24px] sm:w-[24px]" />
                          )}
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
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </>
  )
}
