import { ProfileInfo } from '@/features/ProfileInfo'
import { ProfileMain } from '@/features/ProfileMain'
import { ProfileNav } from '@/features/ProfileNav'
import { Text } from '@/shared/ui/text/Text'

export const ProfilePage = () => {
  return (
    <div className="px-[10px] sm:px-[30px] flex flex-col gap-[22px]">
      <Text as="h1" variant="h1">
        Мой профиль
      </Text>
      <div className="flex w-full gap-[30px]">
        <ProfileNav />
        <div className="flex-1 flex flex-col gap-[20px]">
          <ProfileMain />
          <ProfileInfo />
        </div>
      </div>
    </div>
  )
}
