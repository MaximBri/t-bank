import { useState } from 'react'

import { ProfileNavItem } from '../model/types'
import { profileNavItems } from '../model/constants'
import clsx from 'clsx'

export const ProfileNav = () => {
  const [activeItem, setActiveItem] = useState<ProfileNavItem>(ProfileNavItem.Profile)

  return (
    <nav className="border-2 rounded-lg bg-secondary p-6 border-primary flex flex-col gap-2 max-w-[278px]">
      {profileNavItems.map(({ icon, label, value }) => {
        const isActive = activeItem === value
        return (
          <button
            key={value}
            onClick={() => setActiveItem(value)}
            className={clsx([
              'flex gap-4 font-h3-d rounded-smd hover:bg-primary px-4 py-3 leading-1 transition-all duration-200',
              { ['bg-yellow hover:bg-yellow']: isActive },
            ])}
          >
            {icon}
            {label}
          </button>
        )
      })}
    </nav>
  )
}
