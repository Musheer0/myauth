import { $Enums } from '@prisma/client';

export const getUserIdKey = (id: string) => `user:id:${id}`;
export const getUserEmailKey = (email: string) => `user:email:${email}`;
export const getVerificationTokenKey = (id: string) =>
  `verification:token:${id}`;
export const getOAuthAccountsByProviderOpenIdKey = (
  key: $Enums.PROVIDER,
  id: string,
) => `account:oauth:provider:${key}:openId:${id}`;
export const getOAuthAccountsById = (id: string) => `account:oauth:id:${id}`;
