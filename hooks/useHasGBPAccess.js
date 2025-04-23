'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function useHasGBPAccess() {
  const { data: session, status } = useSession()

  // ✅ 初始狀態直接從 sessionStorage 判斷
  const cachedAccess = typeof window !== 'undefined'
    ? sessionStorage.getItem('hasGBPAccess')
    : null

  const [hasAccess, setHasAccess] = useState(
    cachedAccess === 'true' ? true : cachedAccess === 'false' ? false : null
  )
  const [loading, setLoading] = useState(cachedAccess === null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken || cachedAccess !== null) return

    const verifyAccess = async () => {
      setLoading(true)
      try {
        const res = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })

        const result = await res.json()
        const isAuthorized = res.ok && Array.isArray(result?.accounts) && result.accounts.length > 0

        sessionStorage.setItem('hasGBPAccess', isAuthorized ? 'true' : 'false')
        setHasAccess(isAuthorized)
      } catch (err) {
        console.error('🔍 GBP 權限檢查失敗:', err)
        setError(err.message)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    verifyAccess()
  }, [session?.accessToken, status, cachedAccess])

  return { hasAccess, loading, error }
}
