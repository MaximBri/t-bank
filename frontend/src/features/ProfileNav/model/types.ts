import type { ComponentType, SVGProps } from 'react'

export enum ProfileNavItem {
  Profile = 'profile',
  Notifications = 'notifications',
  Security = 'security',
}

export interface ProfileNavModel {
  label: string
  value: ProfileNavItem
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}
