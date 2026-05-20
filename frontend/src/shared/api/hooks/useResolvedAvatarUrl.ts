import { useQuery } from '@tanstack/react-query'
import { s3Api } from '@/shared/api/s3Api.ts'

const isS3Key = (value: string) => !value.startsWith('http')

export const useResolvedAvatarUrl = (avatarKey?: string | null) => {
  const needsResolve = !!avatarKey && isS3Key(avatarKey)

  const { data } = useQuery({
    queryKey: ['avatar', avatarKey],
    queryFn: () => s3Api.getDownloadUrl(avatarKey!),
    enabled: needsResolve,
    staleTime: 10 * 60 * 1000,
  })

  if (!avatarKey) return null
  if (!needsResolve) return avatarKey
  return data ?? null
}
