'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ProfileCard from './ProfileCard'
import { useHasGBPAccess } from '@/hooks/useHasGBPAccess'

export default function AuthenticatedLayout({ children }) {
  const { data: session } = useSession()
  const [showProfile, setShowProfile] = useState(false)
  const [customerId, setCustomerId] = useState(null)
  const [hasGBPGranted, setHasGBPGranted] = useState(false) // ⬅️ 新增這行
  const { hasAccess, loading } = useHasGBPAccess()

  useEffect(() => {
    if (session?.idToken && session?.refreshToken) {
      fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_token: session.idToken,
          refresh_token: session.refreshToken,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data?.user?.customer_id) {
            setCustomerId(data.user.customer_id)
          }
          if (data?.hasGBPGranted !== undefined) {
            setHasGBPGranted(data.hasGBPGranted) // ⬅️ 擷取授權狀態
          }
        })
        .catch(err => console.error('❌ Cloud Run error:', err))
    }
  }, [session?.idToken, session?.refreshToken])

  if (loading || hasAccess === null) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
        <img src="/spinner.svg" width={48} className="mb-4" />
        <p>正在確認您的商家權限，請稍候...</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="alert p-6 text-red-500 text-center">
        ⚠️ 您尚未完整授權商家存取權限，
        <button
          className="ml-2 underline text-blue-600"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          點此補授權
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Header onProfileClick={() => setShowProfile(!showProfile)} />
        {showProfile && (
          <div className="profile-card-container">
            <ProfileCard session={session} onLogout={() => signOut({ callbackUrl: '/login' })} />
          </div>
        )}
        <main className="dashboard-content">
          {customerId && (
            <div className="dashboard-banner mb-4">
              🎉 歡迎你，客戶代碼：<strong>{customerId}</strong>
              {/* 🧠 可視需要顯示 hasGBPGranted */}
              {/* <div className="text-sm text-gray-400">GBP授權狀態: {hasGBPGranted ? '✅ 已授權' : '⚠️ 未授權'}</div> */}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
