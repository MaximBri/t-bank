import { useUserStore } from '@/entities/user'
import { Text } from '@/shared/ui/text/Text'
import { UserAvatarSizes } from '@/shared/ui/userAvatar/constants'
import { UserAvatar } from '@/shared/ui/userAvatar/UserAvatar'

export const ProfileMain = () => {
  const user = useUserStore((state) => state.user)

  return (
    <section className="p-6 flex flex-1 gap-6 items-center bg-secondary border-2 border-primary rounded-lg">
      <UserAvatar firstName={'a'} lastName={'b'} variant={UserAvatarSizes.Xl} />
      <div>
        <Text as="h2" variant={'h2'}>
          Иван Иваныч
        </Text>
        <Text as="h3" variant="h3" className="text-placeholder">
          {user?.username}
        </Text>
        <Text as="h3" variant="h3" className="text-placeholder">
          Ivanich@mail.ru
        </Text>
      </div>
    </section>
  )
}
