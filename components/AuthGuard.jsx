'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect } from 'react'

export default function AuthGuard({ children }) {
  const { status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('google') // 這裡不顯示「尚未登入畫面」，直接跳轉
    }
  }, [status])

  if (status === 'loading') {
    return <div className="p-6 text-center text-gray-500">🔐 登入狀態確認中...</div>
  }

  if (status === 'unauthenticated') {
    return null // 避免誤顯示錯誤畫面
  }

  return <>{children}</>
}
