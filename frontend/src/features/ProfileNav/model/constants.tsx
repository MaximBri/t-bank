import { ProfileNavItem, ProfileNavModel } from './types'
import UserIcon from '@/shared/assets/icons/user.svg?react'
import NotificationIcon from '@/shared/assets/icons/notification.svg?react'
import SecurityIcon from '@/shared/assets/icons/security.svg?react'

export const profileNavItems: ProfileNavModel[] = [
  { label: 'Профиль', value: ProfileNavItem.Profile, Icon: UserIcon },
  { label: 'Уведомления', value: ProfileNavItem.Notifications, Icon: NotificationIcon },
  { label: 'Безопасность', value: ProfileNavItem.Security, Icon: SecurityIcon },
]

export const profileNavValues: ProfileNavItem[] = profileNavItems.map((item) => item.value)

export const profileDefaultNavItem: ProfileNavItem = ProfileNavItem.Profile
