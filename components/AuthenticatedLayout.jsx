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
  const [canCheckAccess, setCanCheckAccess] = useState(false); // ✅ 控制是否觸發權限檢查

  // 先執行 login 確保資料寫入 firestore
  useEffect(() => {
    const doLogin = async () => {
      if (session?.idToken) {
        try {
          const res = await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: session.idToken }),
          });

          const data = await res.json();
          if (data?.user?.customer_id) {
            setCustomerId(data.user.customer_id);
          }

          // ✅ login 完成後才觸發權限檢查
          setCanCheckAccess(true);
        } catch (err) {
          console.error('❌ login error:', err);
        }
      }
    };

    doLogin();
  }, [session?.idToken]);

  // ⚠️ login 尚未完成，先等一下
  if (status === 'loading' || !canCheckAccess) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
        <img src="/spinner.svg" width={48} className="mb-4" />
        <p>正在確認您的登入狀態...</p>
      </div>
    );
  }

  // ✅ login 完成後才呼叫 useHasGBPAccess
  const { hasAccess, loading } = useHasGBPAccess();

  // ⏳ 等待權限確認
  if (loading || hasAccess === null) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
        <img src="/spinner.svg" width={48} className="mb-4" />
        <p>正在確認您的商家權限，請稍候...</p>
      </div>
    );
  }

  // ❌ 尚未授權 GBP 存取權限
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

  // ✅ 已授權內容
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
