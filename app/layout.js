'use client'

import { SessionProvider } from 'next-auth/react'
import AuthGuard from './AuthGuard'

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </SessionProvider>
  )
}
