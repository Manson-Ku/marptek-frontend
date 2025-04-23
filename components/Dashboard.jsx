'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileCard from './ProfileCard';
import { useHasGBPAccess } from '@/hooks/useHasGBPAccess';

export default function Dashboard() {
  const { data: session, status } = useSession();                    // Hook 1
  const [showProfile, setShowProfile] = useState(false);            // Hook 2
  const [customerId, setCustomerId] = useState(null);               // Hook 3
  const { hasAccess, loading, error } = useHasGBPAccess();          // Hook 4

  // Hook 5: Cloud Run 登入紀錄
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
            setCustomerId(data.user.customer_id);
          }
        })
        .catch(err => console.error('❌ Cloud Run error:', err));
    }
  }, [session?.idToken, session?.refreshToken]);

  // 🚦 渲染邏輯必須在 hooks 之後開始
  if (status === 'loading') return <p>驗證中...</p>;
  if (!session) {
    return (
      <div className="login-screen">
        <h1>尚未登入</h1>
        <button onClick={() => signIn()} className="login-button">前往登入</button>
      </div>
    );
  }

  if (loading) return <p>權限檢查中...</p>;

  if (!hasAccess) {
    return (
      <div className="alert">
        ⚠️ 您尚未完整授權商家存取權限，
        <button
          onClick={() =>
            signIn('google', {
              access_type: 'offline',
              prompt: 'consent',
              scope: 'https://www.googleapis.com/auth/business.manage',
              callbackUrl: '/',
            })
          }
        >
          點此補授權
        </button>
      </div>
    );
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
  );
}
