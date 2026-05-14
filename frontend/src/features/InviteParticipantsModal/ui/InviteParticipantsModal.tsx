import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import CopyIcon from '@/shared/assets/icons/copy.svg?react'
import RefreshIcon from '@/shared/assets/icons/refresh.svg?react'

import { useGetEventInviteToken } from '@/entities/event/api/hooks/useGetEventInviteToken.ts'
import { buildInviteLink } from '@/features/InviteParticipantsModal/lib/build-invite-link.ts'

import { Button } from '@/shared/ui/button/Button.tsx'
import { ButtonEnum } from '@/shared/ui/button/constants.ts'
import { Modal } from '@/shared/ui/modal'
import { Text } from '@/shared/ui/text/Text.tsx'

type InviteParticipantsModalProps = {
  eventId?: string
  isOpen: boolean
  onClose: () => void
}

export const InviteParticipantsModal = ({
  eventId,
  isOpen,
  onClose,
}: InviteParticipantsModalProps) => {
  const { data, refetch, isFetching } = useGetEventInviteToken(eventId, isOpen)
  const inviteLink = data?.token && eventId ? buildInviteLink(eventId, data.token) : ''

  const handleRegenerate = () => {
    refetch()
  }

  const handleCopy = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Ссылка скопирована')
    } catch {
      toast.error('Не удалось скопировать ссылку')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-[620px] p-[15px] sm:p-[40px] rounded-lg bg-secondary"
    >
      <div className="flex flex-col gap-[10px]">
        <div className="flex justify-between gap-[10px]">
          <Text as="h2" className="font-medium text-h3-d sm:text-h2-d">
            Приглашение участников
          </Text>
          <button type="button" onClick={onClose} aria-label="close-invite-modal">
            <CloseIcon className="h-[20px] w-[20px] sm:h-[20px] sm:w-[20px]" />
          </button>
        </div>

        <div className="self-center flex items-center justify-center w-[240px] h-[240px]">
          {inviteLink ? <QRCode value={inviteLink} /> : null}
        </div>

        <Text className="text-center sm:text-start text-body">
          Поделитесь QR-кодом или ссылкой для приглашения
        </Text>

        <div className="flex w-full flex-col gap-[10px] sm:flex-row sm:items-stretch">
          <div className="min-w-0 flex h-[35px] sm:h-[47px] flex-1 items-center rounded-[18px] border-[2px] border-primary bg-primary px-[16px] sm:rounded-md">
            <Text as="span" className="truncate">
              {inviteLink || 'Загрузка...'}
            </Text>
          </div>

          <Button
            type="button"
            variant={ButtonEnum.Primary}
            className="rounded-[18px] px-[18px] max-h-[35px] text-h3 sm:rounded-[20px]"
            onClick={handleCopy}
            disabled={!inviteLink}
          >
            <CopyIcon className="w-[24px] h-[24px]" />
            <Text variant="body">Скопировать</Text>
          </Button>
        </div>

        <div className="w-full border-t border-primary pt-[10px]">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isFetching}
            className="flex w-full items-center justify-center gap-[10px] sm:py-[6px] rounded-[18px] border-[2px] border-primary disabled:opacity-60"
          >
            <RefreshIcon className="w-[16px] h-[16px] sm:w-[20px] sw:h-[20px]" />
            <Text variant="h3" className="font-normal sm:text-h2-d">
              Перегенерировать ссылку
            </Text>
          </button>
        </div>

        <Text className="font-medium text-center text-muted">
          Старая ссылка станет недействительной
        </Text>
      </div>
    </Modal>
  )
}
