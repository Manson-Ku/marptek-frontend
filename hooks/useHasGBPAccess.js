import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * 檢查使用者是否具備 GBP scope 權限
 * 回傳：hasAccess (布林值)、loading、error 狀態
 */
export function useHasGBPAccess() {
  const { data: session, status } = useSession();
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAccess = async () => {
      if (status !== 'authenticated' || !session?.accessToken) return;

      setLoading(true);
      try {
        const res = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        const result = await res.json();

        if (res.ok) {
          setHasAccess(true);
        } else if (result?.error?.status === 'PERMISSION_DENIED') {
          setHasAccess(false);
        } else {
          throw new Error(result?.error?.message || '未知錯誤');
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
