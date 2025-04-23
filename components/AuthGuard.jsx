'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect } from 'react'

export default function AuthGuard({ children }) {
  const { status } = useSession()

  // 若未登入，自動跳轉 Google 登入
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('google')
    }
  }, [status])

  // 尚未判斷完畢（避免畫面閃爍）
  if (status === 'loading') {
    return <div className="p-6 text-center text-gray-500">🔐 登入狀態確認中...</div>
  }

  // 尚未登入（此時 signIn 已啟動，直接 return null）
  if (status === 'unauthenticated') {
    return null
  }

  // 登入成功 → 顯示畫面
  return <>{children}</>
}
