import { useEffect, useState } from 'react'
import userService, { type UserDto } from '../api/userService'

interface UserDisplayProps {
  userId: string
  fallback?: string
}

export default function UserDisplay({ userId, fallback }: UserDisplayProps) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const userData = await userService.getUserById(userId)
        console.log(`Fetched user ${userId}:`, userData)
        setUser(userData)
      } catch (err) {
        console.error(`Failed to fetch user ${userId}:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (loading) {
    return <span>{fallback || userId}</span>
  }

  if (!user) {
    return <span>{fallback || userId}</span>
  }

  return <span title={user.email}>{user.userName || user.email}</span>
}
