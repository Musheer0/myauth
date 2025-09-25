import { PrismaClient, user } from '@prisma/client';
import { google } from 'googleapis';
import { OAuthCallBackGoogleDto } from 'src/auth/dto/oauth-callback-google.dto';
import { getAccountsByProviderOpenId } from '../accounts';
import { BadRequestException } from '@nestjs/common';
import { createSession } from '../../tokens/session-token';
import { ClientMetada, jwt_token } from 'src/shared/types';
import { CreateOAuthUser } from '../create-oauth-user';
export const handleCallbackGoogle = async (
  client: PrismaClient,
  payload: OAuthCallBackGoogleDto,
  metada: ClientMetada,
): Promise<{ mfa: boolean; user: user } | jwt_token> => {
  const oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    payload.redirect_uri,
  );

  const { tokens } = await oauthClient.getToken(payload.code);
  oauthClient.setCredentials(tokens);
  const oauth2 = google.oauth2({ auth: oauthClient, version: 'v2' });
  const { data } = await oauth2.userinfo.get();
  if (!data.id || !data.email || !data.verified_email || !data.picture)
    throw new BadRequestException('invalid code ');
  const existing_account = await getAccountsByProviderOpenId(
    client,
    'GOOGLE',
    data.id,
  );
  if (existing_account) {
    if (existing_account.user.mfa_enabled) {
      return { mfa: true, user: existing_account.user };
    }
    const session = await createSession(
      client,
      metada,
      existing_account.user_id,
    );
    return session;
  }
  const new_user = await CreateOAuthUser(
    client,
    {
      email: data.email,
      picture: data.picture,
      scopes: tokens.scope || 'error',
      access_token: tokens.access_token || 'error',
      refresh_token: tokens.refresh_token || 'error',
    },
    'GOOGLE',
  );
  const new_account = await client.account.create({
    data: {
      open_id: data.id,
      initial_info: JSON.stringify(data),
      provider: 'GOOGLE',
      access_token: '',
      refresh_token: '',
      user_id: new_user.id,
    },
  });
  if (new_user.mfa_enabled) {
    return { mfa: true, user: new_user };
  }
  const session = await createSession(client, metada, new_account.user_id);
  return session;
};
