'use client'

import { SessionProvider } from 'next-auth/react'
import AuthGuard from '@/components/AuthGuard'

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </SessionProvider>
  )
}
