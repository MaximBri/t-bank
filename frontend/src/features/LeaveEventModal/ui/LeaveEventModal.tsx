import CloseIcon from '@/shared/assets/icons/close.svg?react'
import ExitIcon from '@/shared/assets/icons/exit.svg?react'
import WarningIcon from '@/shared/assets/icons/warning-yellow.svg?react'
import ArrowsSortIcon from '@/shared/assets/icons/arrows-sort.svg?react'
import BlockIcon from '@/shared/assets/icons/block.svg?react'

import { Button } from '@/shared/ui/button/Button'
import { ButtonEnum } from '@/shared/ui/button/constants'
import { Modal } from '@/shared/ui/modal'
import { Text } from '@/shared/ui/text/Text'

type LeaveEventModalProps = {
  hasSettlements: boolean
  isOpen: boolean
  onClose: () => void
  onNavigateToSettlements?: () => void
  onSubmit?: () => void
}

export const LeaveEventModal = ({
  hasSettlements,
  isOpen,
  onClose,
  onNavigateToSettlements,
  onSubmit,
}: LeaveEventModalProps) => {
  const handleSubmit = () => {
    if (hasSettlements) {
      onNavigateToSettlements?.()
      onClose()
      return
    }

    onSubmit?.()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-[320px] sm:w-[587px] rounded-lg border border-primary bg-secondary"
    >
      <div className="relative flex flex-col items-center p-[15px] sm:p-[40px] text-center">
        <button
          type="button"
          aria-label="close-leave-event-modal"
          className="absolute right-[20px] top-[20px] transition-opacity hover:opacity-70"
          onClick={onClose}
        >
          <CloseIcon width={20} height={20} />
        </button>
        <div className="mb-[16px]">
          {hasSettlements ? (
            <BlockIcon className="h-[55px] w-[55px] sm:h-[70px] sm:w-[70px]" />
          ) : (
            <WarningIcon className="h-[50px] w-[50px] sm:h-[64px] sm:w-[64px] " />
          )}
        </div>

        <Text as="h1" variant="h1">
          {hasSettlements ? 'Пока нельзя выйти' : 'Вы уверены что хотите покинуть событие?'}
        </Text>

        <Text className="mt-[20px] text-center text-h3-d sm:text-h2-d">
          {hasSettlements
            ? 'У вас имеются задолженности перед другими участниками. Для начала закройте их, чтобы покинуть событие'
            : 'У вас нет незакрытых задолженностей перед другими участниками. Вы можете покинуть данное событие'}
        </Text>

        <Button
          type="button"
          className="mt-[20px] rounded-[16px] text-h3-d sm:text-h2-d sm:min-h-[52px] text-primary"
          variant={hasSettlements ? ButtonEnum.Primary : ButtonEnum.Tertiary}
          onClick={handleSubmit}
        >
          {hasSettlements ? (
            <>
              <ArrowsSortIcon className="h-[21px] w-[21px] sm:h-[31px] sm:w-[31px]" />
              <span>К взаиморасчётам</span>
            </>
          ) : (
            <>
              <ExitIcon className="h-[21px] w-[21px] sm:h-[31px] sm:w-[31px] text-secondary" />
              <span>Покинуть</span>
            </>
          )}
        </Button>
      </div>
    </Modal>
  )
}
