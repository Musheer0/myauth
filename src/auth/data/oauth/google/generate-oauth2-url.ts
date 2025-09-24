import { google } from 'googleapis';

export const getGoogleOauthUrl = (redirect_uri: string, state: string) => {
  const base64enoded = Buffer.from(state).toString('base64url');
  const oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri,
  );
  const scopes = ['openid', 'email', 'profile'].join(' ');
  const oauthUrl = oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: base64enoded,
  });
  return oauthUrl;
};
