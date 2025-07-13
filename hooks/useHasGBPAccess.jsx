'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function useHasGBPAccess() {
  const { data: session, status } = useSession()
  const [hasAccess, setHasAccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }
    if (status !== 'authenticated') {
      setHasAccess(null)
      setLoading(false)
      return
    }
    if (!session?.idToken) {
      setHasAccess(null)
      setLoading(false)
      return
    }

    const checkAccess = async () => {
      try {
        setLoading(true)
        setError(null)
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

    // 延遲執行避免跳畫面
    const timer = setTimeout(() => {
      checkAccess()
    }, 500)

    return () => clearTimeout(timer)
  }, [status, session?.idToken])

  return { hasAccess, loading, error }
}
