import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useHasGBPAccess() {
  const { data: session, status } = useSession();
  const [hasAccess, setHasAccess] = useState(null);  // null = 尚未確認, true/false = 結果
  const [loading, setLoading] = useState(true);      // 初始為 true
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ 僅在「成功登入」且「accessToken 有值」時才執行
    if (status !== 'authenticated' || !session?.accessToken) {
      setLoading(false);
      return;
    }

    const verifyAccess = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (res.ok) {
          setHasAccess(true);
        } else {
          const result = await res.json();
          if (result?.error?.status === 'PERMISSION_DENIED') {
            setHasAccess(false);
          } else {
            throw new Error(result?.error?.message || '未知錯誤');
          }
        }
      } catch (err) {
        console.error('🔍 GBP 權限檢查失敗:', err);
        setError(err.message);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAccess();
  }, [session?.accessToken, status]);

  return { hasAccess, loading, error };
}
