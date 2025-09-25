import { $Enums, Prisma } from '@prisma/client';
import { redis } from 'src/shared/redis';
import { getOAuthAccountsByProviderOpenIdKey } from 'src/shared/utils';
import { PrismaClient } from '@prisma/client';
export type AccountWithUser = Prisma.accountGetPayload<{
  include: {
    user: true;
  };
}>;
export const getAccountsByProviderOpenId = async (
  client: PrismaClient,
  provider: $Enums.PROVIDER,
  id: string,
) => {
  const cache = await redis.get<AccountWithUser>(
    getOAuthAccountsByProviderOpenIdKey(provider, id),
  );
  if (cache) return cache;
  const account = await client.account.findFirst({
    where: {
      provider: provider,
      open_id: id,
    },
    include: {
      user: true,
    },
  });
  return account;
};
