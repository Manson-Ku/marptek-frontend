'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileCard from './ProfileCard';
import { useHasGBPAccess } from '@/hooks/useHasGBPAccess';

export default function AuthenticatedLayout({ children }) {
  const { data: session, status } = useSession();
  const [showProfile, setShowProfile] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [accessVersion, setAccessVersion] = useState(0); // 🔁 觸發權限檢查
  const { hasAccess, loading } = useHasGBPAccess(accessVersion);

  // ✅ 每次登入時觸發後端 login 並刷新權限狀態
  useEffect(() => {
    if (session?.idToken) {
      fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: session.idToken }),
      })
        .then(res => res.json())
        .then(data => {
          if (data?.user?.customer_id) {
            setCustomerId(data.user.customer_id);
            setAccessVersion(v => v + 1); // 🔁 觸發 GBP 權限重新檢查
          }
        })
        .catch(err => console.error('❌ Cloud Run error:', err));
    }
  }, [session?.idToken]);

  // 🔄 尚未完成檢查時顯示 loading 畫面
  if (status === 'loading' || loading || hasAccess === null) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
        <img src="/spinner.svg" width={48} className="mb-4" />
        <p>正在確認您的商家權限，請稍候...</p>
      </div>
    );
  }

  // ❌ 尚未授權 GBP 權限時顯示提示畫面
  if (!hasAccess) {
    const handleConsent = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = process.env.NEXT_PUBLIC_GBP_CALLBACK_URL;
      const scope = 'openid email profile https://www.googleapis.com/auth/business.manage';
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&access_type=offline&prompt=consent&scope=${encodeURIComponent(scope)}`;
      window.location.href = url;
    };

    return (
      <div className="alert p-6 text-red-500 text-center">
        ⚠️ 您尚未完整授權商家存取權限，
        <button className="ml-2 underline text-blue-600" onClick={handleConsent}>
          點此完成授權
        </button>
        <br />
        <button className="mt-4 text-sm text-gray-500 underline" onClick={() => signOut({ callbackUrl: '/login' })}>
          重新登入
        </button>
      </div>
    );
  }

  // ✅ 授權成功後顯示主畫面內容
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
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
