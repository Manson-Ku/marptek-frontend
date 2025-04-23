'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function useHasGBPAccess() {
  const { data: session, status } = useSession()
  const [hasAccess, setHasAccess] = useState(null) // null = 尚未確認, true/false = 結果
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    if (!session?.accessToken) {
      console.warn('⚠️ accessToken 尚未準備好，延後 GBP 權限檢查')
      return
    }

    // 🧠 加入 sessionStorage 快取邏輯
    const cachedAccess = sessionStorage.getItem('hasGBPAccess')
    if (cachedAccess !== null) {
      setHasAccess(cachedAccess === 'true')
      setLoading(false)
      return
    }

    const verifyAccess = async () => {
      setLoading(true)
      try {
        const res = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })

        if (res.ok) {
          const result = await res.json()
          const isAuthorized = Array.isArray(result?.accounts) && result.accounts.length > 0
          sessionStorage.setItem('hasGBPAccess', isAuthorized ? 'true' : 'false')
          setHasAccess(isAuthorized)
        } else {
          const result = await res.json()
          if (result?.error?.status === 'PERMISSION_DENIED') {
            sessionStorage.setItem('hasGBPAccess', 'false')
            setHasAccess(false)
          } else {
            throw new Error(result?.error?.message || '未知錯誤')
          }
        }
      } catch (err) {
        console.error('🔍 GBP 權限檢查失敗:', err)
        setError(err.message)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    verifyAccess()
  }, [session?.accessToken, status])

  return { hasAccess, loading, error }
}
