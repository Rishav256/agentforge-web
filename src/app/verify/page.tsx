'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Panel } from '@/components/ui/Panel';
import { exchangeCode } from './actions';

export default function Verify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying');
  const [error, setError] = useState('');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get('code');

    if (!code) {
      setStatus('error');
      setError('No authorization code found in URL');
      return;
    }

    const codeVerifier = localStorage.getItem('nhost_pkce_verifier');
    localStorage.removeItem('nhost_pkce_verifier');

    if (!codeVerifier) {
      setStatus('error');
      setError(
        'No PKCE verifier found. The verification link must be opened in the same browser you signed up with.',
      );
      return;
    }

    exchangeCode(code, codeVerifier).then((result) => {
      if (result.success) {
        router.push('/orgs');
      } else {
        setStatus('error');
        setError(result.error ?? 'Verification failed');
      }
    });
  }, [searchParams, router]);

  return (
    <div className="flex flex-1 items-center justify-center bg-bg p-6">
      <Panel className="w-full max-w-sm p-8 text-center">
        {status === 'verifying' ? (
          <p className="text-sm text-text-secondary">Verifying…</p>
        ) : (
          <div className="rounded-md border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
            {error}
          </div>
        )}
      </Panel>
    </div>
  );
}
