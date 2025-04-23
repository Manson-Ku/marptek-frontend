'use client'

import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function GoogleQAPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Google QA 管理</h1>
        <p className="text-gray-600">
          這裡會列出所有商家在 Google Maps 上的問與答內容，並提供回覆、標記與排序功能。
        </p>
        <div className="p-4 border rounded-md bg-white text-sm text-gray-500">
          ⏳ 功能建置中，預計支援自動摘要、篩選條件與回覆建議。
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
