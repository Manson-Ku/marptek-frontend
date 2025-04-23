'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';

const LocaleContext = createContext(null);

export function useLocale() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(null); // ✅ 改成 null，避免預設 zh-TW 造成 hydration mismatch
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') || 'zh-TW';
    setLocale(storedLocale);
  }, []);

  useEffect(() => {
    if (!locale) return;
    const loadMessages = async () => {
      try {
        const response = await fetch(`/messages/${locale}.json?_=${Date.now()}`);
        if (!response.ok) {
          console.error('❌ Fetch messages failed:', response.status);
          return;
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('❌ Load messages error', error);
      }
    };
    loadMessages();
  }, [locale]);

  // ✅ 若語系尚未載入，不渲染任何內容，避免 hydration mismatch
  if (!locale || !messages) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
