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

    const cached = sessionStorage.getItem('hasGBPAccess')
    if (cached === 'true') {
      setHasAccess(true)
      setLoading(false)
      return
    } else if (cached === 'false') {
      setHasAccess(false)
      setLoading(false)
      return
    }

    const fetchAccess = async () => {
      try {
        const res = await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/check-gbp-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: session.idToken }),
        })

        const result = await res.json()
        const isGranted = result?.hasGBPGranted === true

        sessionStorage.setItem('hasGBPAccess', isGranted ? 'true' : 'false')
        setHasAccess(isGranted)
      } catch (err) {
        console.error('🔍 check-gbp-access 錯誤:', err)
        setError(err.message)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    fetchAccess()
  }, [status, session?.idToken])

  return { hasAccess, loading, error }
}
