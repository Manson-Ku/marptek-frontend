'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileCard from './ProfileCard';
import { useState } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showProfile, setShowProfile] = useState(false);

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
