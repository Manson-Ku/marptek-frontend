'use client'

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ProfileCard from './ProfileCard'
import { useHasGBPAccess } from '@/hooks/useHasGBPAccess'

export default function Dashboard() {
  const { data: session } = useSession()
  const [showProfile, setShowProfile] = useState(false)
  const [customerId, setCustomerId] = useState(null)
  const { hasAccess, loading } = useHasGBPAccess()

  // 取得 customerId
  useEffect(() => {
    if (session?.idToken) {
      fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_token: session.idToken
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
  }, [session?.idToken])

  // loading階段顯示
  if (loading || hasAccess === null) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: '#666'
      }}>
        <img src="/spinner.svg" width={48} style={{ marginBottom: 16 }} />
        <p>正在確認您的商家權限，請稍候...</p>
      </div>
    )
  }

  // 👉 GBP 授權按鈕
  const handleConsent = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_GBP_CALLBACK_URL
    const scope = 'openid email profile https://www.googleapis.com/auth/business.manage'
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&access_type=offline&prompt=consent&scope=${encodeURIComponent(scope)}`
    window.location.href = url
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
            <div className="dashboard-banner">
              🎉 歡迎你，客戶代碼：<strong>{customerId}</strong>
              {hasAccess ? (
                <span className="dashboard-gbp-auth">
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.707 6.293a1 1 0 010 1.414l-7.071 7.071a1 1 0 01-1.414 0l-3.536-3.536a1 1 0 111.414-1.414L9 12.586l6.293-6.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  已授權
                </span>
              ) : (
                <button
                  onClick={handleConsent}
                  className="dashboard-gbp-auth-btn"
                >
                  👉 點此完成 GBP 授權
                </button>
              )}
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
