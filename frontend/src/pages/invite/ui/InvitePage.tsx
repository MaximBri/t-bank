import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { toast } from 'sonner'

import CalendarIcon from '@/shared/assets/icons/calendar.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import ImageIcon from '@/shared/assets/icons/image-filled.svg?react'
import UsersIcon from '@/shared/assets/icons/users.svg?react'

import { useUserStore } from '@/entities/user'
import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent'
import { eventStatusMap, formatDateRange } from '@/entities/event'
import { APP_ROUTES } from '@/shared/routes'
import { pendingInvite } from '@/shared/lib/pendingInvite'
import { formatParticipantsCount } from '@/shared/lib/formatParticipantsCount'

import { Button } from '@/shared/ui/button/Button'
import { ButtonEnum } from '@/shared/ui/button/constants'
import { Modal } from '@/shared/ui/modal'
import { Text } from '@/shared/ui/text/Text'

export const InvitePage = () => {
  const { eventId, token } = useParams<{ eventId: string; token: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const logout = useUserStore((state) => state.logout)

  const { data: event } = useGetEvent(eventId)

  const goHome = () => navigate(APP_ROUTES.HOME, { replace: true })

  const handleAccept = async () => {
    if (isAuthenticated) {
      await logout()
      toast.info('Войдите снова, чтобы отправить заявку организатору')
    }
    navigate(APP_ROUTES.LOGIN, { replace: true })
  }

  const handleRegister = async () => {
    if (isAuthenticated) {
      await logout()
    }
    navigate(APP_ROUTES.REGISTER, { replace: true })
  }

  const handleDecline = () => {
    pendingInvite.clear()
    goHome()
  }

  useEffect(() => {
    if (token) pendingInvite.set(token)
  }, [token])

  return (
    <Modal
      isOpen={!!token}
      onClose={handleDecline}
      className="w-full max-w-[560px] rounded-lg bg-secondary"
    >
      <div className="flex flex-col gap-[20px] p-[20px] sm:p-[30px]">
        <div className="flex items-start justify-between gap-[16px]">
          <Text as="h2" variant="h2" className="font-medium">
            Приглашение в событие
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

        {event && (
          <div className="flex flex-col gap-[12px] rounded-[12px] border-[2px] border-primary p-[14px] sm:flex-row sm:items-center sm:gap-[16px]">
            <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-primary">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon width={40} height={40} />
              )}
            </div>

            <div className="flex flex-1 flex-col gap-[6px]">
              <Text as="h3" variant="h3" className="font-medium">
                {event.title}
              </Text>
              <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px] text-body text-primary">
                <span className="inline-flex items-center gap-[6px]">
                  <CalendarIcon width={20} height={20} />
                  {formatDateRange(event.startDate, event.endDate)}
                </span>
                <span className="inline-flex items-center gap-[6px]">
                  <UsersIcon width={20} height={20} />
                  {formatParticipantsCount(event.countOfParticipants)}
                </span>
              </div>
              <Text
                className={clsx(
                  eventStatusMap[event.status].background,
                  'w-fit rounded-[48px] px-[12px] py-[2px] text-body font-normal',
                )}
              >
                {eventStatusMap[event.status].label}
              </Text>
            </div>
          </div>
        )}

        <Text className="text-body">
          {isAuthenticated
            ? 'Чтобы заявка ушла организатору, нужно перезайти в аккаунт. Мы запомнили ссылку — она применится после входа.'
            : 'Войдите или зарегистрируйтесь, чтобы отправить заявку организатору. После его подтверждения вы попадёте на страницу события.'}
        </Text>

        <div className="flex flex-col gap-[10px] sm:flex-row">
          <Button type="button" onClick={handleAccept} className="font-medium sm:w-[200px]">
            {isAuthenticated ? 'Перезайти и присоединиться' : 'Войти'}
          </Button>
          {!isAuthenticated && (
            <Button
              type="button"
              variant={ButtonEnum.Tertiary}
              onClick={handleRegister}
              className="font-medium sm:w-[220px]"
            >
              Зарегистрироваться
            </Button>
          )}
          <Button
            type="button"
            variant={ButtonEnum.TertiaryLight}
            onClick={handleDecline}
            className="font-medium sm:w-[180px]"
          >
            Отклонить
          </Button>
        </div>
      </div>
    </Modal>
  )
}
