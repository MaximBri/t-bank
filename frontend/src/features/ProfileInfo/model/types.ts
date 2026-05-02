import { ProfileSchemaValues } from './schema'
import UserIcon from '@/shared/assets/icons/user.svg?react'

export type ProfileItem = {
  name: keyof ProfileSchemaValues
  label: string
  value: string
  icon: typeof UserIcon
}
