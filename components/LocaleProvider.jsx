'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';

const LocaleContext = createContext(null);

export function useLocale() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({ children }) {
  const [locale, setLocale] = useState('zh-TW');
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') || 'zh-TW';
    setLocale(storedLocale);
    loadMessages(storedLocale);
  }, []);

  // 當 locale 改變時，自動重新 fetch 對應的 messages
  useEffect(() => {
    if (locale) {
      loadMessages(locale);
    }
  }, [locale]);

  const loadMessages = async (targetLocale) => {
    try {
      const response = await fetch(`/messages/${targetLocale}.json?_=${Date.now()}`);
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

  if (!messages) {
    // 當 messages 還沒準備好時，不渲染
    return null;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
