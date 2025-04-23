'use client'

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ProfileCard from './ProfileCard'
import { useHasGBPAccess } from '@/hooks/useHasGBPAccess'

export default function Dashboard() {
  const { data: session } = useSession()                            // 不再處理 status
  const [showProfile, setShowProfile] = useState(false)
  const [customerId, setCustomerId] = useState(null)
  const { hasAccess, loading } = useHasGBPAccess()

  // 呼叫 Cloud Run API 寫入登入記錄
  useEffect(() => {
    if (session?.idToken && session?.refreshToken) {
      fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_token: session.idToken,
          refresh_token: session.refreshToken
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data?.user?.customer_id) {
            setCustomerId(data.user.customer_id)
          }
        })
        .catch(err => console.error('❌ Cloud Run error:', err))
    }
  }, [session?.idToken, session?.refreshToken])

  // ✅ 商家權限尚未確認完成（包含 loading 中 或 hasAccess 尚未決定）
  if (loading || hasAccess === null) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: '#666',
        fontSize: '1rem'
      }}>
        <img src="/spinner.svg" alt="Loading..." width="48" height="48" style={{ marginBottom: '1rem' }} />
        <p>正在確認您的商家權限，請稍候...</p>
      </div>
    )
  }
  

  // ❌ 已確定為未授權，顯示提示 UI
  if (!hasAccess) {
    return (
      <div className="alert p-6 text-red-500 text-center">
        ⚠️ 您尚未完整授權商家存取權限，
        <button
          className="ml-2 underline text-blue-600"
          onClick={() =>
            signOut({
              callbackUrl: '/login',
            })
          }
        >
          點此補授權
        </button>
      </div>
    )
  }


  // ✅ 主畫面
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Header onProfileClick={() => setShowProfile(!showProfile)} />
        {showProfile && (
          <div className="profile-card-container">
            <ProfileCard
              session={session}
              onLogout={() => signOut({ callbackUrl: '/login' })}
            />
          </div>
        )}
        <main className="dashboard-content">
          {customerId && (
            <div className="dashboard-banner">
              🎉 歡迎你，客戶代碼：<strong>{customerId}</strong>
            </div>
          )}
          <div className="dashboard-grid">
            <div className="dashboard-card">Placeholder 1</div>
            <div className="dashboard-card">Placeholder 2</div>
            <div className="dashboard-card">Placeholder 3</div>
          </div>
        </main>
      </div>
    </div>
  )
}
