import { useUserStore } from '@/entities/user'
import { Text } from '@/shared/ui/text/Text'
import { UserAvatarSizes } from '@/shared/ui/userAvatar/constants'
import { UserAvatar } from '@/shared/ui/userAvatar/UserAvatar'
import { useMediaQuery } from 'react-responsive'

export const ProfileMain = () => {
  const user = useUserStore((state) => state.user)
  const isMobile = useMediaQuery({ maxWidth: 768 })

  return (
    <section className="p-[10px] md:p-6 flex flex-1 flex-col items-center gap-4 md:flex-row md:gap-6 bg-secondary border-2 border-primary rounded-md md:rounded-lg">
      <UserAvatar
        firstName={user?.firstName}
        lastName={user?.lastName}
        login={user?.login}
        avatarUrl={user?.avatarPreviewUrl}
        variant={isMobile ? UserAvatarSizes.M : UserAvatarSizes.Xl}
      />
      <div className="text-center md:text-left">
        <Text as="h2" variant={'h2'}>
          Иван Иваныч
        </Text>
        <Text as="h3" variant="h3" className="text-placeholder">
          {user?.login}
        </Text>
        <Text as="h3" variant="h3" className="text-placeholder">
          Ivanich@mail.ru
        </Text>
      </div>
    </section>
  )
}
