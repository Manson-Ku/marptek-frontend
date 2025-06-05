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
        // 先呼叫後端兌換 refresh_token
        const res = await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/token-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, id_token: session.idToken }),
        });

        const data = await res.json();
        if (!data.refresh_token) {
          throw new Error('兌換 refresh_token 失敗');
        }

        // 再補寫入 login
        await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_token: session.idToken,
            refresh_token: data.refresh_token,
          }),
        });

        // 成功後導回首頁
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
      <p>Processing，please wait...</p>
    </div>
  );
}
