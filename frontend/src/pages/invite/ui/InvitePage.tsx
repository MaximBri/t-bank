import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import clsx from 'clsx'

import CalendarIcon from '@/shared/assets/icons/calendar.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import ImageIcon from '@/shared/assets/icons/image-filled.svg?react'
import UsersIcon from '@/shared/assets/icons/users.svg?react'

import { useUserStore } from '@/entities/user'
import { useGetEventPreview } from '@/entities/event/api/hooks/useGetEventPreview'
import { eventsApi } from '@/entities/event'
import { eventStatusMap, formatDateRange } from '@/entities/event'
import { EventStatus } from '@/entities/event/model/types'
import { APP_ROUTES } from '@/shared/routes'
import { pendingInvite } from '@/shared/lib/pendingInvite'
import { formatParticipantsCount } from '@/shared/lib/formatParticipantsCount'

import { Button } from '@/shared/ui/button/Button'
import { ButtonEnum } from '@/shared/ui/button/constants'
import { Modal } from '@/shared/ui/modal'
import { Text } from '@/shared/ui/text/Text'
import { UserAvatar } from '@/shared/ui/userAvatar/UserAvatar'
import { UserAvatarSizes } from '@/shared/ui/userAvatar/constants'

const calcStatus = (startDate: string, endDate: string): EventStatus => {
  const now = new Date()
  if (now < new Date(startDate)) return EventStatus.Planned
  if (now > new Date(endDate)) return EventStatus.Completed
  return EventStatus.Active
}

export const InvitePage = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const [isApplying, setIsApplying] = useState(false)

  const { data: preview } = useGetEventPreview(token)

  const goHome = () => navigate(APP_ROUTES.HOME, { replace: true })

  const handleAccept = async () => {
    if (isAuthenticated) {
      if (!token) return
      setIsApplying(true)
      try {
        await eventsApi.applyByToken(token)
        pendingInvite.clear()
        toast.success('Заявка отправлена организатору')
        navigate(APP_ROUTES.HOME, { replace: true })
      } catch {
        toast.error('Не удалось отправить заявку')
      } finally {
        setIsApplying(false)
      }
    } else {
      if (token) pendingInvite.set(token)
      navigate(APP_ROUTES.LOGIN, { replace: true })
    }
  }

  const handleRegister = () => {
    if (token) pendingInvite.set(token)
    navigate(APP_ROUTES.REGISTER, { replace: true })
  }

  const handleDecline = () => {
    pendingInvite.clear()
    goHome()
  }

  useEffect(() => {
    if (token && !isAuthenticated) pendingInvite.set(token)
  }, [token, isAuthenticated])

  const status = preview ? calcStatus(preview.startDate, preview.endDate) : null
  const statusInfo = status ? eventStatusMap[status] : null
  const creatorName = preview
    ? [preview.creatorInfo.firstName, preview.creatorInfo.secondName].filter(Boolean).join(' ') ||
      preview.creatorInfo.login
    : ''

  return (
    <Modal
      isOpen={!!token}
      onClose={handleDecline}
      className="w-full max-w-[560px] rounded-lg bg-secondary"
    >
      <div className="flex flex-col gap-[20px] p-[20px] sm:p-[30px]">
        <div className="flex items-start justify-between gap-[16px]">
          <Text as="h2" variant="h2" className="font-medium">
            Вас пригласили поучаствовать в событии
          </Text>
          <button
            type="button"
            onClick={handleDecline}
            aria-label="close-invite-page"
            className="transition-opacity hover:opacity-70"
          >
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        {preview && (
          <>
            <div className="flex flex-col gap-[12px] rounded-[12px] border-[2px] border-primary p-[14px] sm:flex-row sm:items-center sm:gap-[16px]">
              <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-primary">
                {preview.imageUrl ? (
                  <img
                    src={preview.imageUrl}
                    alt={preview.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon width={40} height={40} />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-[6px]">
                <Text as="h3" variant="h3" className="font-medium">
                  {preview.title}
                </Text>
                <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px] text-body text-primary">
                  <span className="inline-flex items-center gap-[6px]">
                    <CalendarIcon width={20} height={20} />
                    {formatDateRange(preview.startDate, preview.endDate)}
                  </span>
                  <span className="inline-flex items-center gap-[6px]">
                    <UsersIcon width={20} height={20} />
                    {formatParticipantsCount(preview.participantCount)}
                  </span>
                </div>
                {statusInfo && (
                  <Text
                    className={clsx(
                      statusInfo.background,
                      'w-fit rounded-[48px] px-[12px] py-[2px] text-body font-normal',
                    )}
                  >
                    {statusInfo.label}
                  </Text>
                )}
              </div>
            </div>

            <div>
              <Text variant="h3" className="mb-[12px] font-medium">
                Организатор события
              </Text>
              <div className="flex items-center gap-[12px]">
                <UserAvatar
                  firstName={preview.creatorInfo.firstName}
                  lastName={preview.creatorInfo.secondName}
                  login={preview.creatorInfo.login}
                  avatarUrl={preview.creatorInfo.avatarUrl || undefined}
                  variant={UserAvatarSizes.M}
                />
                <div className="flex flex-col">
                  <Text variant="h3" className="font-medium">
                    {creatorName}
                  </Text>
                  <Text variant="body" className="text-placeholder">
                    {preview.creatorInfo.login}
                  </Text>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="rounded-[12px] border border-yellow bg-yellow/20 px-[16px] py-[12px]">
          <Text className="text-body">
            После подтверждения организатора вы сразу попадёте на страницу события
          </Text>
        </div>

        <div className="flex flex-col justify-center items-center gap-[20px]">
          <div className="flex flex-col gap-[10px] sm:flex-row">
            <Button
              type="button"
              onClick={handleAccept}
              disabled={isApplying}
              className="font-medium"
            >
              Присоединиться
            </Button>
            {!isAuthenticated && (
              <Button
                type="button"
                variant={ButtonEnum.Tertiary}
                onClick={handleRegister}
                className="font-medium"
              >
                Зарегистрироваться
              </Button>
            )}
          </div>
          <Button
              type="button"
              variant={ButtonEnum.TertiaryLight}
              onClick={handleDecline}
              className="font-medium w-fit"
          >
            Отклонить приглашение
          </Button>
        </div>
      </div>
    </Modal>
  )
}
