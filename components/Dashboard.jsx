'use client'

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from 'react'
import { useCustomer } from '@/context/CustomerContext'
import Sidebar from './Sidebar'
import Header from './Header'
import ProfileCard from './ProfileCard'
import { useHasGBPAccess } from '@/hooks/useHasGBPAccess'

export default function Dashboard() {
  const { data: session } = useSession()
  const { customerId, loading: customerLoading, error: customerError } = useCustomer()
  const [showProfile, setShowProfile] = useState(false)
  const { hasAccess, loading } = useHasGBPAccess()
  const [locationsLoading, setLocationsLoading] = useState(false)

  // 帳戶資料 state
  const [accountData, setAccountData] = useState([])
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState(null)

  // 地點列表 state
  const [locations, setLocations] = useState([])
  const [filteredLocations, setFilteredLocations] = useState([])
  const [selectedAccountID, setSelectedAccountID] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 100

  // 區塊收合控制：只剩一個收合狀態
  const [showSection, setShowSection] = useState(false)

  // 讀取帳戶群組
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

  // 讀取地點列表
  useEffect(() => {
    if (customerId) {
      setLocationsLoading(true)
      fetch(`/api/auth/locations?customer_id=${customerId}`)
        .then(res => res.json())
        .then(data => {
          setLocations(data.locations || [])
          setFilteredLocations(data.locations || [])
          setLocationsLoading(false)
        })
        .catch(e => {
          setLocations([])
          setFilteredLocations([])
          setLocationsLoading(false)
        })
    }
  }, [customerId])

  // 帳戶按鈕 onClick
  const handleAccountClick = (accountResourceName) => {
    setSelectedAccountID(accountResourceName)
    setCurrentPage(1)
    if (accountResourceName) {
      setFilteredLocations(locations.filter(loc => loc.accountID === accountResourceName))
    } else {
      setFilteredLocations(locations)
    }
  }

  // 分頁處理
  const pageCount = Math.ceil(filteredLocations.length / pageSize)
  const displayLocations = filteredLocations.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // loading 階段顯示
  if (customerLoading || loading || hasAccess === null) {
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

  if (customerError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'red'
      }}>
        <p>取得 customerId 錯誤：{customerError}</p>
        <button onClick={() => signOut({ callbackUrl: '/login' })}>重新登入</button>
      </div>
    )
  }

  // GBP 授權按鈕
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
          {/* --- 上方圖表區預留 --- */}
          <div
            style={{
              width: '100%',
              height: 260,
              background: '#f8f8fa',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              color: '#aaa',
              marginBottom: 32,
              border: '1px dashed #ddd'
            }}>
            <span>（預留圖表區，例如評論圓餅圖、曲線圖等）</span>
          </div>

          {/* --- Banner 與授權 --- */}
          {customerId && (
            <div className="dashboard-banner">
              🎉 歡迎你，客戶代碼：<strong>{customerId}</strong>
              {hasAccess ? (
                <span className="dashboard-gbp-auth">
                  <svg className="dashboard-gbp-auth-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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

          {/* --- Accordion 區塊，帳戶＋地點聯動同一個摺疊，並排 --- */}
          <div className="dashboard-accordion" style={{ marginTop: 32 }}>
            <div className="dashboard-accordion-section" style={{ marginBottom: 18 }}>
              <button
                className="accordion-toggle"
                onClick={() => setShowSection(v => !v)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 20,
                  padding: '12px 0',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                {showSection ? '▼' : '▶'} 地區群組/帳戶列表 & 地點列表（{filteredLocations.length}）
              </button>
              {showSection && (
                <div className="dashboard-row" style={{
                  display: 'flex',
                  gap: 24,
                  alignItems: 'flex-start'
                }}>
                  {/* 帳戶群組/帳戶列表（左） */}
                  <div className="dashboard-card" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <h3 style={{ marginTop: 0 }}>地區群組/帳戶列表</h3>
                    {accountLoading && <div>載入中...</div>}
                    {accountError && <div style={{ color: 'red' }}>{accountError}</div>}
                    {accountData && accountData.length > 0 ? (
                      <ul style={{ paddingLeft: 0 }}>
                        <li>
                          <button
                            className={`account-btn${selectedAccountID === null ? ' active' : ''}`}
                            onClick={() => handleAccountClick(null)}
                          >全部</button>
                        </li>
                        {accountData.map(acc => (
                          <li key={acc.name}>
                            <button
                              className={`account-btn${selectedAccountID === acc.name ? ' active' : ''}`}
                              onClick={() => handleAccountClick(acc.name)}
                            >
                              {acc.accountName || acc.name}
                            </button>
                            <div className="account-meta">
                              ID: {acc.name}<br />
                              有效: {String(acc.is_active)}<br />
                              更新: {typeof acc.upd_datetime === 'string' ? acc.upd_datetime : acc.upd_datetime?.value}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : !accountLoading && <div>找不到資料</div>}
                  </div>
                  {/* 地點列表（右） */}
                  <div className="dashboard-card" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <h3 style={{ marginTop: 0 }}>地點列表（{filteredLocations.length}）</h3>
                    <ul className="location-list">
                      {locationsLoading ? (
                        <li className="location-item">載入中...</li>
                      ) : displayLocations.length > 0 ? (
                        displayLocations.map(loc => (
                          <li className="location-item" key={loc.name}>
                            <strong>名稱：{loc.title || '（未命名）'}</strong><br />
                            ID：{loc.name}<br />
                            有效: {String(loc.is_active)}<br />
                            更新: {typeof loc.upd_datetime === 'string'
                              ? loc.upd_datetime
                              : loc.upd_datetime?.value || ''}
                          </li>
                        ))
                      ) : (
                        <li className="location-item">找不到地點資料</li>
                      )}
                    </ul>
                    <div className="pagination">
                      {Array.from({ length: pageCount }).map((_, idx) =>
                        <button
                          className={`pagination-btn${currentPage === idx + 1 ? ' active' : ''}`}
                          onClick={() => setCurrentPage(idx + 1)}
                          key={idx}
                        >{idx + 1}</button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* --- 右側 placeholder，保留不收合 --- */}
            <div className="dashboard-card">Placeholder 3</div>
          </div>
        </main>
      </div>
    </div>
  )
}
