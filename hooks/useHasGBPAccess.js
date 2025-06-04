'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function useHasGBPAccess() {
  const { data: session, status } = useSession()
  const [hasAccess, setHasAccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status !== 'authenticated' || !session?.idToken) return

    const checkAccess = async () => {
      setLoading(true)
      try {
        const res = await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/check-gbp-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: session.idToken }),
        })

        const data = await res.json()
        setHasAccess(data.hasGBPGranted)
      } catch (err) {
        console.error('🔍 GBP 權限檢查失敗:', err)
        setError(err.message)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [session?.idToken, status])

  return { hasAccess, loading, error }
}
