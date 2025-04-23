'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { NextIntlClientProvider } from 'next-intl'

const LocaleContext = createContext(null)

export function useLocale() {
  return useContext(LocaleContext)
}

export default function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(null)
  const [messages, setMessages] = useState(null)

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') || 'zh-TW'
    setLocale(storedLocale)
  }, [])

  useEffect(() => {
    if (!locale) return
    const loadMessages = async () => {
      try {
        const response = await fetch(`/messages/${locale}.json?_=${Date.now()}`)
        if (!response.ok) {
          console.error('❌ Fetch messages failed:', response.status)
          return
        }
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error('❌ Load messages error', error)
      }
    }
    loadMessages()
  }, [locale])

  const ready = locale && messages

  if (!ready) {
    return typeof children === 'function' ? children(false) : null
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {typeof children === 'function' ? children(true) : children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}
