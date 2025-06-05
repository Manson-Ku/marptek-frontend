'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError('缺少 code');
      return;
    }

    const exchangeTokens = async () => {
      try {
        // 前端直接兌換 refresh_token
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: code,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.NEXT_PUBLIC_GBP_CALLBACK_URL,
            grant_type: 'authorization_code',
          }),
        });

        const tokenData = await res.json();
        console.log('tokenData:', tokenData);

        if (!tokenData.refresh_token || !tokenData.id_token) {
          throw new Error('兌換 refresh_token 失敗');
        }

        // 直接拿 Google OAuth response 裡面的 id_token + refresh_token 傳給後端
        await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_token: tokenData.id_token,  // <-- 直接用 Google 回傳 id_token
            refresh_token: tokenData.refresh_token,
          }),
        });

        router.replace('/');
      } catch (err) {
        console.error('二階段授權錯誤', err);
        setError('二階段授權失敗');
      }
    };

    exchangeTokens();
  }, [searchParams, router]);

  if (error) {
    return <div className="p-6 text-center text-red-500">⚠️ {error}</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
      <img src="/spinner.svg" width={48} className="mb-4" />
      <p>正在完成授權流程，請稍候...</p>
    </div>
  );
}
