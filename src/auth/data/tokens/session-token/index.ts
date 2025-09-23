/* eslint-disable  @typescript-eslint/no-unsafe-member-access */

/* eslint-disable   @typescript-eslint/no-unsafe-assignment*/

import { PrismaClient } from '@prisma/client';
import { ClientMetada, jwt_token } from 'src/shared/types';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetUserByEmail, GetUserById } from '../../user/utils';

/**
 * Helper to fetch location from IP using free API
 */
async function fetchLocation(ip: string) {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city`,
    );
    const data = await res.json();
    if (data.status !== 'success') return '';
    return `${data.city || ''}, ${data.regionName || ''}, ${data.country || ''}`;
  } catch (err) {
    console.error(err);
    return ''; // fail silently
  }
}

/**
 * Create a session (default 7 days expiry) with IP location parsing
 */
export async function createSession(
  client: PrismaClient,
  metadata: ClientMetada,
  user_id: string,
  expiresInDays = 7,
) {
  const now = new Date();
  const expires_at = new Date(
    now.getTime() + expiresInDays * 24 * 60 * 60 * 1000,
  );

  const location = await fetchLocation(metadata.ip);

  const session = await client.session.create({
    data: {
      client: metadata.user_agent,
      ip: metadata.ip,
      parsed_location: location,
      user_id,
      expires_at,
    },
  });

  return {
    token_id: session.id,
    user_id: session.user_id,
  } as jwt_token;
}

/**
 * Verify a session by ID
 * options.get_user = true will include the user object
 */
export async function verifySession(
  client: PrismaClient,
  session_id: string,
  options: { get_user?: boolean } = {},
) {
  const session = await client.session.findUnique({
    where: { id: session_id },
  });

  if (!session) throw new NotFoundException('Session not found');
  if (session.expires_at < new Date())
    throw new ForbiddenException('Session expired');
  if (options.get_user) {
    const user = await GetUserById(client, session.user_id, { strict: true });
    return { session, user };
  }
  // Update last_used
  await client.session.update({
    where: { id: session_id },
    data: { last_used: new Date() },
  });

  return { session, user: null };
}

/**
 * Delete a session by ID
 */
export async function deleteSession(client: PrismaClient, session_id: string) {
  const session = await client.session.findUnique({
    where: { id: session_id },
  });
  if (!session) throw new NotFoundException('Session not found');

  await client.session.delete({ where: { id: session_id } });
  return { success: true };
}
export async function deleteSessionAll(
  client: PrismaClient,
  jwt_token: jwt_token,
) {
  await client.session.deleteMany({
    where: { user_id: jwt_token.user_id, id: { not: jwt_token.token_id } },
  });
  return { success: true };
}
export async function deleteSessionAllByEmail(
  client: PrismaClient,
  email: string,
) {
  const user = await GetUserByEmail(client, email);
  if (!user) return { success: false };
  await client.session.deleteMany({
    where: { user_id: user.id },
  });
  return { success: true };
}

export async function getAllSession(
  client: PrismaClient,
  jwt_token: jwt_token,
) {
  return client.session
    .findMany({
      where: {
        user_id: jwt_token.user_id,
      },
      orderBy: {
        last_used: 'desc',
      },
    })
    .then((data) =>
      data.map((e) => ({ ...e, primary: e.id == jwt_token.token_id })),
    );
}
