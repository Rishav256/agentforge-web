import { createServerClient, type NhostClient } from '@nhost/nhost-js';
import {
  DEFAULT_SESSION_KEY,
  type StoredSession,
} from '@nhost/nhost-js/session';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';

const key = DEFAULT_SESSION_KEY;

/**
 * Server component / server action client.
 * Reads/writes the session cookie via Next.js's async cookies() API.
 */
export async function createNhostClient(): Promise<NhostClient> {
  const cookieStore = await cookies();

  return createServerClient({
    region: process.env['NHOST_REGION'] || 'local',
    subdomain: process.env['NHOST_SUBDOMAIN'] || 'local',
    storage: {
      get: (): StoredSession | null => {
        const s = cookieStore.get(key)?.value || null;
        return s ? (JSON.parse(s) as StoredSession) : null;
      },
      set: (value: StoredSession) => {
        cookieStore.set(key, JSON.stringify(value));
      },
      remove: () => {
        cookieStore.delete(key);
      },
    },
  });
}

/**
 * Proxy client. Reads from the request cookie, writes to the response cookie,
 * refreshes the token if it's expiring within 60s. Called on every request
 * (public or protected) so session state stays current across tabs/reloads.
 */
export async function handleNhostProxy(
  request: NextRequest,
  response: NextResponse<unknown>,
): Promise<StoredSession | null> {
  const nhost = createServerClient({
    region: process.env['NHOST_REGION'] || 'local',
    subdomain: process.env['NHOST_SUBDOMAIN'] || 'local',
    storage: {
      get: (): StoredSession | null => {
        const raw = request.cookies.get(key)?.value || null;
        return raw ? (JSON.parse(raw) as StoredSession) : null;
      },
      set: (value: StoredSession) => {
        response.cookies.set({
          name: key,
          value: JSON.stringify(value),
          path: '/',
          httpOnly: false, // must be readable client-side too
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
        });
      },
      remove: () => {
        response.cookies.delete(key);
      },
    },
  });

  return await nhost.refreshSession(60);
}
