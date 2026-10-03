'use client';

import {
  DEFAULT_SESSION_KEY,
  type StoredSession,
} from '@nhost/nhost-js/session';

export function getBrowserAccessToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${DEFAULT_SESSION_KEY}=`));

  if (!match) return null;

  try {
    const raw = decodeURIComponent(match.slice(match.indexOf('=') + 1));
    const session = JSON.parse(raw) as StoredSession;
    return session.accessToken ?? null;
  } catch {
    return null;
  }
}
