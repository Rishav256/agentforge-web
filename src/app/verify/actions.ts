'use server';

import type { ErrorResponse } from '@nhost/nhost-js/auth';
import type { FetchError } from '@nhost/nhost-js/fetch';
import { createNhostClient } from '@/lib/nhost/server';

export async function exchangeCode(code: string, codeVerifier: string) {
  try {
    const nhost = await createNhostClient();
    await nhost.auth.tokenExchange({ code, codeVerifier });
    return { success: true };
  } catch (err) {
    console.error('[exchangeCode] Raw error:', err);
    const error = err as FetchError<ErrorResponse>;
    return { success: false, error: `Verification failed: ${error.message}` };
  }
}
