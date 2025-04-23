'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileCard from './ProfileCard';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showProfile, setShowProfile] = useState(false);
  const [customerId, setCustomerId] = useState(null); // ✅ 儲存從 Cloud Run 拿到的 customer_id

  // ✅ 當 session.idToken 出現時，呼叫 Cloud Run
  useEffect(() => {
    const callCloudRunLogin = async () => {
      if (session?.idToken) {
        try {
          const res = await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_token: session.idToken }),
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
  }, [session?.idToken]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

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

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="dashboard-main">
        {/* Header */}
        <Header onProfileClick={() => setShowProfile(!showProfile)} />

        {/* Profile Card */}
        {showProfile && (
          <div className="profile-card-container">
            <ProfileCard
              session={session}
              onLogout={() => signOut({ callbackUrl: '/login' })}
            />
          </div>
        )}

        {/* Main Content */}
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
