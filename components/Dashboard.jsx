'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useAuthContext } from '@/context/AuthContext'

export default function Dashboard() {
  const { data: session } = useSession()
  const { customerId } = useAuthContext()
  const [showProfile, setShowProfile] = useState(false)

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
