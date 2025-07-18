'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'

const fetcher = async ([url, idToken]) => {
  if (!idToken) return null

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
  })
  const data = await res.json()
  // SWR 規則：只丟 exception 才會進 error
  if (!res.ok) throw new Error(data?.error || '權限查詢失敗')
  return data
}

export function useHasGBPAccess() {
  const { data: session, status } = useSession()

  // SWR key 若為 null 不會發 request（等 idToken 有才查）
  const shouldFetch =
    status === 'authenticated' && !!session?.idToken

  const { data, error, isLoading } = useSWR(
    shouldFetch
      ? [
          'https://marptek-login-api-84949832003.asia-east1.run.app/check-gbp-access',
          session.idToken,
        ]
      : null,
    fetcher,
    {
      // 可以根據需要調整 refreshInterval（自動輪詢）
      // refreshInterval: 60000, // 每 1 分鐘查一次
      // revalidateOnFocus: true, // 切回畫面自動刷新（預設就是 true）
    }
  )

  return {
    hasAccess: data?.hasGBPGranted ?? null,
    loading: isLoading || status === 'loading',
    error,
  }
}
