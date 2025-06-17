// app/dashboard/layout.jsx
'use client'

import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function DashboardLayout({ children }) {
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  )
}
