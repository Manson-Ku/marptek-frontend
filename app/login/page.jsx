'use client';

import { NextIntlClientProvider, useMessages, useLocale } from 'next-intl';
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { smartSignIn } from '@/utils/authUtils'; // ✅ 新增引用

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
    await smartSignIn(session);
    setLoading(false);
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-box">
            <h1 className="login-title">{t('title')}</h1>

            {error && (
              <div className="login-error">
                {t('loginError')}
              </div>
            )}

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
