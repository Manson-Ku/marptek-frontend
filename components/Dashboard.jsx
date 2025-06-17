'use client'

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from 'react'
import { useAuthContext } from '@/context/AuthContext'

export default function Dashboard() {
  const { data: session } = useSession()
  const [showProfile, setShowProfile] = useState(false)
  const [customerId, setCustomerId] = useState(null)
  const { customerId: contextCustomerId } = useAuthContext()

  useEffect(() => {
    if (contextCustomerId) {
      setCustomerId(contextCustomerId)
    }
  }, [contextCustomerId])

  return (
    <main className="dashboard-content">
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
    </main>
  )
}
