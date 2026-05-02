import { useEffect } from 'react'

import { useUserStore } from '@/entities/user'

export const AuthBootstrap = () => {
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser)

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  return null
}
