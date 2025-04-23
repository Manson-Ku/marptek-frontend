'use client';
import { NextIntlClientProvider, useMessages, useLocale } from 'next-intl';
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const messages = useMessages();  // ✅ 拿到翻譯
  const locale = useLocale();      // ✅ 拿到當前語系

  const t = useTranslations('Login');
  const { status } = useSession();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return <p>{t('loading')}</p>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await signIn('credentials', {
      email: form.email,
      password: form.password,
      callbackUrl: '/',
      redirect: true,
    });

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="login-container">

        {/* ✅ 新增一層 login-wrapper */}
        <div className="login-wrapper">
          
          {/* 登入盒 */}
          <div className="login-box">
            <h1 className="login-title">{t('title')}</h1>

            {error && (
              <div className="login-error">
                {t('loginError')}
              </div>
            )}

            {false && (
              <form onSubmit={handleSubmit} className="login-form">
                <input
                  name="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="login-input"
                />
                <input
                  name="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="login-input"
                />
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? t('loggingIn') : t('signInWithPassword')}
                </button>
              </form>
            )}
            {false && (
            <div className="login-divider">{t('or')}</div>
            )}
            <button
              onClick={handleGoogleLogin}
              className="google-button"
            >
              {t('signInWithGoogle')}
            </button>
          </div>

          {/* 語系切換器 (現在跟login-box在同一個wrapper內) */}
          <div className="language-switcher-container">
            <LanguageSwitcher />
          </div>

        </div>

      </div>
    </NextIntlClientProvider>
  );
}
