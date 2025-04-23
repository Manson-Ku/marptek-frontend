'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileCard from './ProfileCard';
import { useHasGBPAccess } from '@/hooks/useHasGBPAccess';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showProfile, setShowProfile] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const hasGBP = useHasGBPAccess();

  // ✅ 認證狀態尚未完成
  if (status === "loading" || hasGBP === 'loading') {
    return <p>驗證中...</p>;
  }

  // ✅ 尚未登入
  if (!session) {
    return (
      <div className="login-screen">
        <h1>尚未登入</h1>
        <button onClick={() => signIn()} className="login-button">
          前往登入
        </button>
      </div>
    );
  }

  // ✅ 已登入但缺少 GBP 權限
  if (!hasGBP) {
    return (
      <div className="alert">
        ⚠️ 您尚未完整授權商家存取權限，
        <button
          onClick={() => signIn('google', {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'https://www.googleapis.com/auth/business.manage',
            callbackUrl: '/',
          })}
        >
          點此補授權
        </button>
      </div>
    );
  }

  // ✅ 有 session + 有 GBP 權限，再送 Cloud Run API
  useEffect(() => {
    const callCloudRunLogin = async () => {
      if (session?.idToken && session?.refreshToken) {
        try {
          const res = await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_token: session.idToken,
              refresh_token: session.refreshToken
            }),
          });

          const data = await res.json();
          console.log('✅ Cloud Run Response:', data);

          if (data?.user?.customer_id) {
            setCustomerId(data.user.customer_id);
          }
        } catch (err) {
          console.error('❌ 呼叫 Cloud Run 發生錯誤:', err);
        }
      }
    };

    callCloudRunLogin();
  }, [session?.idToken, session?.refreshToken]);

  // ✅ 畫面內容
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
