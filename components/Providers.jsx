'use client';

import { SessionProvider } from 'next-auth/react';
import LocaleProvider from '@/components/LocaleProvider';
import { CustomerProvider } from '@/context/CustomerContext'; // ⭐️ 加這行

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CustomerProvider>
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </CustomerProvider>
    </SessionProvider>
  );
}
