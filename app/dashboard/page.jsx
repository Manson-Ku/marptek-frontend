'use client'

import { useAuthContext } from '@/context/AuthContext'

export default function Dashboard() {
  const { customerId } = useAuthContext()

  return (
    <>
      {customerId && (
        <div className="dashboard-banner mb-4">
          🎉 歡迎你，客戶代碼：<strong>{customerId}</strong>
        </div>
      )}
      <div className="dashboard-grid">
        <div className="dashboard-card">Placeholder 1</div>
        <div className="dashboard-card">Placeholder 2</div>
        <div className="dashboard-card">Placeholder 3</div>
      </div>
    </>
  )
}
