'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [error, setError] = useState(null);
  const [exchanged, setExchanged] = useState(false); // ✅ 避免重複觸發
  const [syncing, setSyncing] = useState(false); // 🟢 新增「同步授權狀態」狀態

  // 🟢 輪詢 check-gbp-access，最多 retry 8 次（6~8 秒）
  const pollCheckGBPAccess = async (idToken, maxRetry = 8) => {
    let retry = 0;
    while (retry < maxRetry) {
      try {
        const res = await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/check-gbp-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: idToken }),
        });
        const data = await res.json();
        if (res.ok && data.hasGBPGranted === true) {
          return true;
        }
      } catch (err) {
        // 可以忽略，繼續 retry
      }
      await new Promise(r => setTimeout(r, 800)); // 0.8 秒輪詢
      retry++;
    }
    return false;
  };

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) return;

    // 等待 session hydrate 完成
    if (status === 'loading') return;

    if (!session?.idToken) {
      setError('未登入');
      return;
    }

    if (exchanged) return;

    const exchangeTokens = async () => {
      try {
        setSyncing(false); // reset
        // 1. Google 換 token
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
        if (!tokenData.refresh_token) throw new Error('兌換 refresh_token 失敗');

        // 2. 通知 backend login 寫入 refresh_token
        await fetch('https://marptek-login-api-84949832003.asia-east1.run.app/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_token: session.idToken,
            refresh_token: tokenData.refresh_token,
          }),
        });

        setSyncing(true); // 進入同步狀態
        setExchanged(true);

        // 3. 🟢 等 hasGBPGranted = true 才 redirect
        const ok = await pollCheckGBPAccess(session.idToken);
        if (ok) {
          window.location.href = '/';
        } else {
          setError('權限同步超時，請重新登入');
        }
      } catch (err) {
        console.error('二階段授權錯誤', err);
        setError('二階段授權失敗');
      }
    };

    exchangeTokens();
  }, [searchParams, router, session, status, exchanged]);

  if (error) {
    return <div className="p-6 text-center text-red-500">⚠️ {error}</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
      <img src="/spinner.svg" width={48} className="mb-4" />
      {syncing ? (
        <p>授權已完成，正在同步權限狀態，請稍候...</p>
      ) : (
        <p>正在完成授權流程，請稍候...</p>
      )}
    </div>
  );
}
