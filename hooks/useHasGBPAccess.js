'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function useHasGBPAccess() {
  const { data: session, status } = useSession()
  const [hasAccess, setHasAccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status !== 'authenticated' || !session?.idToken) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    const timer = setTimeout(() => {
      const checkAccess = async () => {
        try {
          const res = await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/check-gbp-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: session.idToken }),
          })

          const data = await res.json()

          if (res.ok && data.hasGBPGranted === true) {
            setHasAccess(true)
          } else {
            setHasAccess(false)
          }
        } catch (err) {
          console.error('❌ 檢查權限失敗:', err)
          setError(err.message)
          setHasAccess(false)
        } finally {
          setLoading(false)
        }
      }

      checkAccess()
    }, 500) // ✅ 延遲 500 毫秒再執行

    return () => clearTimeout(timer)  // 清除計時器避免 memory leak
  }, [status, session?.idToken])

  return { hasAccess, loading, error }
}
