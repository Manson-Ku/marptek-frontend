'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileCard from './ProfileCard';

export default function AuthenticatedLayout({ children }) {
  const { data: session, status } = useSession();
  const [showProfile, setShowProfile] = useState(false);

  // 尚未判斷登入狀態
  if (status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
        <img src="/spinner.svg" width={48} className="mb-4" />
        <p>正在確認您的登入狀態，請稍候...</p>
      </div>
    );
  }

  // 未登入
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
        <div className="p-6 text-center">
          <p>尚未登入，請重新登入。</p>
          <button
            className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            返回登入頁
          </button>
        </div>
      </div>
    );
  }

  // 已登入，顯示主畫面
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
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
