import { EventSection } from '@/widgets/event-sections-nav'
import { ReactNode } from 'react'
import CoinsIcon from '@/shared/assets/icons/coins.svg?react'
import ArrowGrowthIcon from '@/shared/assets/icons/arrow-growth.svg?react'
import UsersIcon from '@/shared/assets/icons/users.svg?react'
import HistoryIcon from '@/shared/assets/icons/history.svg?react'

const iconClassName = 'h-[36px] w-[36px] sm:h-[48px] sm:w-[48px]'

export const getIconBySection = (section: EventSection): ReactNode => {
  switch (section) {
    case EventSection.expenses:
      return <CoinsIcon className={iconClassName} />
    case EventSection.settlements:
      return <ArrowGrowthIcon className={iconClassName} />
    case EventSection.participants:
      return <UsersIcon className={iconClassName} />
    case EventSection.history:
      return <HistoryIcon className={iconClassName} />
    default:
      return <></>
  }
}
