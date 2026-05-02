import clsx from 'clsx'

import { ProfileNavItem } from '../model/types'
import { profileNavItems } from '../model/constants'

type ProfileNavProps = {
  activeItem: ProfileNavItem
  onItemChange: (item: ProfileNavItem) => void
}

export const ProfileNav = ({ activeItem, onItemChange }: ProfileNavProps) => {
  return (
    <nav
      className="
        bg-secondary border-2 border-primary rounded-md md:rounded-lg overflow-hidden
        md:overflow-visible md:max-w-[278px] h-full
      "
    >
      <div
        className="
          flex flex-row gap-2 overflow-x-auto whitespace-nowrap no-scrollbar p-[10px]
          md:flex-col md:overflow-visible md:whitespace-normal md:p-6
        "
      >
        {profileNavItems.map(({ Icon, label, value }) => {
          const isActive = activeItem === value
          return (
            <button
              key={value}
              onClick={() => onItemChange(value)}
              className={clsx([
                'h-[30px] md:h-auto flex shrink-0 items-center gap-4 font-h3-d rounded-[10px] md:rounded-smd hover:bg-primary px-4 py-3 leading-1 transition-all duration-200',
                { ['bg-yellow hover:bg-yellow']: isActive },
              ])}
            >
              <Icon className="w-[18px] h-[18px] md:w-6 md:h-6" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
