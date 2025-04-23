'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function AuthGuard({ children }) {
  const { status } = useSession()
  const pathname = usePathname()

  const publicPaths = ['/login']

  useEffect(() => {
    if (status === 'unauthenticated' && !publicPaths.includes(pathname)) {
      signIn('google')
    }
  }, [status, pathname])

  if (status === 'loading') {
    return <div className="p-6 text-center text-gray-500">🔐 驗證登入中...</div>
  }

  if (status === 'unauthenticated' && !publicPaths.includes(pathname)) {
    return null
  }

  return <>{children}</>
}
