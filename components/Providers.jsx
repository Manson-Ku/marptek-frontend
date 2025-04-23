'use client'; // ✅ 這行一定要放最上面

import { SessionProvider } from 'next-auth/react';
import LocaleProvider from '@/components/LocaleProvider';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        {children}
      </LocaleProvider>
    </SessionProvider>
  );
}
