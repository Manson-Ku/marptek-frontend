'use client'

import { NextIntlClientProvider, useMessages, useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { smartSignIn } from '@/utils/authUtils'

export default function LoginPage() {
  const messages = useMessages()
  const locale = useLocale()
  const t = useTranslations('Login')
  const { status, data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const error = searchParams.get('error')

  // ✅ 已登入者直接導回首頁（或 dashboard）
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/') // 或 '/dashboard'
    }
  }, [status])

  if (status === 'loading') {
    return <p className="p-6 text-center">{t('loading')}</p>
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    await smartSignIn(session)
    setLoading(false)
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="login-container">
        <video
          className="login-bg-video"
          src="/login_bg_video.mp4"
          autoPlay
          muted
          loop
          playsInline
        ></video>

        <div className="login-wrapper">
          <div className="login-box">
            <h1 className="login-title">{t('title')}</h1>
            {error && <div className="login-error">{t('loginError')}</div>}
            <button
              onClick={handleGoogleLogin}
              className="google-button"
              disabled={loading}
            >
              {loading ? t('loggingIn') : t('signInWithGoogle')}
            </button>
          </div>

          <div className="language-switcher-container">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </NextIntlClientProvider>
  )
}
