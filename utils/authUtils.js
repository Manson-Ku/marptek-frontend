import { signIn } from 'next-auth/react';

export const smartSignIn = async () => {
  await signIn('google', {
    callbackUrl: '/',
    prompt: 'select_account',
    scope: 'openid email profile',
  });
};
