import { signIn } from 'next-auth/react';

/**
 * 智慧登入：
 * - 第一次登入（沒有 refreshToken）用 prompt: 'consent'
 * - 之後登入則改用 prompt: 'select_account'
 */
export const smartSignIn = async (session) => {
  const isFirstLogin = !session?.refreshToken;

  await signIn('google', {
    callbackUrl: '/',
    access_type: 'offline',
    prompt: isFirstLogin ? 'consent' : 'select_account',
  });
};
