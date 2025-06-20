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

  // 帳戶資料 state
  const [accountData, setAccountData] = useState(null)
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState(null)

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

  // 根據 customerId 讀取 BigQuery API
  useEffect(() => {
    if (customerId) {
      setAccountLoading(true)
      setAccountError(null)
      fetch(`/api/auth/accounts?customer_id=${customerId}`)
        .then(res => res.json())
        .then(data => {
          if (data.accounts) setAccountData(data.accounts)
          else setAccountError(data.error || '查無資料')
          setAccountLoading(false)
        })
        .catch(err => {
          setAccountError('API 錯誤：' + err.message)
          setAccountLoading(false)
        })
    }
  }, [customerId])

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
            {/* Placeholder 1：顯示 BigQuery 讀到的帳戶/地區群組 */}
            <div className="dashboard-card">
              <h3>地區群組/帳戶列表</h3>
              {accountLoading && <div>載入中...</div>}
              {accountError && <div style={{ color: 'red' }}>{accountError}</div>}
              {accountData && accountData.length > 0 ? (
                <ul>
                  {accountData.map(acc => (
                    <li>
                      <strong>{acc.accountName}</strong>
                      <div className="account-meta">
                        ID: {acc.customer_id}<br/>
                        有效: {String(acc.is_active)}<br/>
                        更新: {typeof acc.upd_datetime === 'string' ? acc.upd_datetime : acc.upd_datetime?.value}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : !accountLoading && <div>找不到資料</div>}
            </div>
            <div className="dashboard-card">Placeholder 2</div>
            <div className="dashboard-card">Placeholder 3</div>
          </div>
        </main>
      </div>
    </div>
  )
}
