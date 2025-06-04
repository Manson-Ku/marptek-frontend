'use client';

import { NextIntlClientProvider, useMessages, useLocale } from 'next-intl';
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { smartSignIn } from '@/utils/authUtils';

export default function LoginPage() {
  const messages = useMessages();
  const locale = useLocale();
  const t = useTranslations('Login');
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await smartSignIn();
    setLoading(false);
  };

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
  );
}
