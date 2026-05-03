import type { ReactNode } from 'react'

import { ProfileInfo } from '@/features/ProfileInfo'
import { ProfileNotifications } from '@/features/ProfileNotifications'
import { ProfileSecurity } from '@/features/ProfileSecurity'
import { ProfileNavItem } from '@/features/ProfileNav'

export const profileSections: Record<ProfileNavItem, ReactNode> = {
  [ProfileNavItem.Profile]: <ProfileInfo />,
  [ProfileNavItem.Notifications]: <ProfileNotifications />,
  [ProfileNavItem.Security]: <ProfileSecurity />,
}
