'use server';

import type { ErrorResponse } from '@nhost/nhost-js/auth';
import type { FetchError } from '@nhost/nhost-js/fetch';
import { createNhostClient } from '@/lib/nhost/server';

export async function signUp(
  email: string,
  password: string,
  codeChallenge: string,
) {
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const nhost = await createNhostClient();
    const response = await nhost.auth.signUpEmailPassword({
      email,
      password,
      options: {
        redirectTo: `${process.env['APP_URL']}/verify`,
      },
      codeChallenge,
    });

    if (response.body?.session) {
      return { redirect: '/orgs' };
    }
    return { awaitingVerification: true };
  } catch (err) {
    console.error('[signUp] Raw error:', err);
    const error = err as FetchError<ErrorResponse>;
    return { error: `Sign up failed: ${error.message}` };
  }
}
