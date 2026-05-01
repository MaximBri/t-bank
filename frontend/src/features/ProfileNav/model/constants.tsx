import { ProfileNavItem, ProfileNavModel } from './types'
import UserIcon from '@/shared/assets/icons/user.svg?react'
import NotificationIcon from '@/shared/assets/icons/notification.svg?react'
import SecurityIcon from '@/shared/assets/icons/security.svg?react'

export const profileNavItems: ProfileNavModel[] = [
  { label: 'Профиль', value: ProfileNavItem.Profile, icon: <UserIcon width={24} height={24} /> },
  {
    label: 'Уведомления',
    value: ProfileNavItem.Notifications,
    icon: <NotificationIcon width={24} height={24} />,
  },
  {
    label: 'Безопасность',
    value: ProfileNavItem.Security,
    icon: <SecurityIcon width={24} height={24} />,
  },
]
