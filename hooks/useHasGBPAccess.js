'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function useHasGBPAccess() {
  const { data: session, status } = useSession()

  // ✅ 初始狀態從 sessionStorage 取快取
  const cachedAccess = typeof window !== 'undefined'
    ? sessionStorage.getItem('hasGBPAccess')
    : null

  const [hasAccess, setHasAccess] = useState(
    cachedAccess === 'true' ? true : cachedAccess === 'false' ? false : null
  )
  const [loading, setLoading] = useState(cachedAccess === null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status !== 'authenticated' || !session?.idToken || cachedAccess !== null) return

    const timer = setTimeout(async () => {
      try {
        setLoading(true)

        const res = await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: session.idToken }),
        })

        const data = await res.json()
        const isAuthorized = !!data?.user?.refresh_token

        sessionStorage.setItem('hasGBPAccess', isAuthorized ? 'true' : 'false')
        setHasAccess(isAuthorized)
      } catch (err) {
        console.error('🔍 GBP 權限檢查失敗:', err)
        setError(err.message)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }, 2000) // ✅ 延遲 2000ms 再執行

    return () => clearTimeout(timer)
  }, [session?.idToken, status, cachedAccess])

  return { hasAccess, loading, error }
}
