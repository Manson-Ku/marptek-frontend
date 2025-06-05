'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthCallback() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code || !session?.idToken) {
      setError('缺少 code 或 id_token');
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

        if (!tokenData.refresh_token) {
          throw new Error('兌換 refresh_token 失敗');
        }

        // 將 id_token 與 refresh_token 送回後端 login
        await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_token: session.idToken,
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
  }, [searchParams, session, router]);

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
