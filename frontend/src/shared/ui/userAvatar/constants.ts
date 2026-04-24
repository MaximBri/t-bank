export enum UserAvatarSizes {
  Xs = 'xs',
  S = 's',
  M = 'm',
  L = 'l',
  Xl = 'xl',
}

export const avatarSizeClasses: Record<UserAvatarSizes, string> = {
  [UserAvatarSizes.Xl]: 'w-[150px] h-[150px] text-10',
  [UserAvatarSizes.L]: 'w-[80px] h-[80px] text-h2-d',
  [UserAvatarSizes.M]: 'w-[75px] h-[75px] text-h2-d',
  [UserAvatarSizes.S]: 'w-[60px] h-[60px] text-[20px]',
  [UserAvatarSizes.Xs]: 'w-10 h-10 text-caption',
}
