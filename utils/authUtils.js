import { signIn } from 'next-auth/react';

export const smartSignIn = async (session) => {
  const isFirstLogin = !session?.refreshToken;

  await signIn('google', {
    callbackUrl: '/',
    access_type: 'offline',
    prompt: isFirstLogin ? 'consent' : 'select_account',
    scope: isFirstLogin
      ? 'openid email profile https://www.googleapis.com/auth/business.manage'
      : 'openid email profile',
  });
};
