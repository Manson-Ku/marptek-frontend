'use client';

import { SessionProvider } from 'next-auth/react';
import Dashboard from '@/components/Dashboard';

export default function HomePage() {
  return (
    <SessionProvider>
      <Dashboard />
    </SessionProvider>
  );
}
