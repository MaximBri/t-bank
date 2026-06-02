import { ProfileMain } from '@/features/ProfileMain'
import {
  ProfileNav,
  ProfileNavItem,
  profileDefaultNavItem,
  profileNavValues,
} from '@/features/ProfileNav'
import { useSectionChange } from '@/shared/lib/page-sections/use-section-change'
import { APP_ROUTES } from '@/shared/routes'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { Text } from '@/shared/ui/text/Text'

import { profileSections } from '../lib/profileSections'

export const ProfilePage = () => {
  const { activeSection, handleSectionChange } = useSectionChange<ProfileNavItem>({
    sections: profileNavValues,
    defaultSection: profileDefaultNavItem,
  })

  return (
    <div className="px-[10px] sm:px-[30px] flex flex-col gap-[15px] md:gap-[22px]">
      <Breadcrumbs
        items={[
          { label: 'Главная', to: APP_ROUTES.HOME },
          { label: 'Мой профиль' },
        ]}
      />
      <Text as="h1" variant="h1" className="hidden md:block">
        Мой профиль
      </Text>
      <div
        className="
          grid w-full gap-[10px]
          grid-cols-1 grid-rows-[auto_auto_auto]
          md:grid-cols-[278px_minmax(0,1fr)] md:grid-rows-[auto_auto] md:gap-x-[30px] md:gap-y-[20px]
        "
      >
        <div className="md:col-start-2 md:row-start-1">
          <ProfileMain />
        </div>
        <div className="md:col-start-1 md:row-start-1 md:row-span-2 h-full">
          <ProfileNav activeItem={activeSection} onItemChange={handleSectionChange} />
        </div>
        <div className="md:col-start-2 md:row-start-2">
          {profileSections[activeSection]}
        </div>
      </div>
    </div>
  )
}
