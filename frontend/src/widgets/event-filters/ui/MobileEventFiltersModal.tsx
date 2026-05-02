import { Modal } from '@/shared/ui/modal'

import { EventFiltersWidget } from './EventFiltersWidget'

type MobileEventFiltersModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const MobileEventFiltersModal = ({ isOpen, onClose }: MobileEventFiltersModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="relative rounded-lg sm:hidden">
      <EventFiltersWidget onClose={onClose} />
    </Modal>
  )
}
