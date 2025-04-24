'use client';

import { NextIntlClientProvider, useMessages, useLocale } from 'next-intl';
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { smartSignIn } from '@/utils/authUtils';

export default function LoginPage() {
  const messages = useMessages();
  const locale = useLocale();
  const t = useTranslations('Login');
  const { status, data: session } = useSession();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return <p>{t('loading')}</p>;
  }

  const handleGoogleLogin = async () => {
    setLoading(true);

    let isFirstLogin = true;

    if (session?.idToken) {
      try {
        const res = await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: session.idToken }),
        });

        const data = await res.json();
        isFirstLogin = !data.hasGBPGranted;
      } catch (err) {
        console.warn('⚠️ 無法確認是否授權過 GBP，預設為首次登入', err);
      }
    }

    await smartSignIn(isFirstLogin);
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
