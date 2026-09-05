'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { generatePKCEPair } from '@nhost/nhost-js/auth';
import { cn } from '@/lib/utils';
import { signUp } from './actions';

export default function SignUpForm() {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const router = useRouter();

  const emailId = useId();
  const passwordId = useId();

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(undefined);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { verifier, challenge } = await generatePKCEPair();
      localStorage.setItem('nhost_pkce_verifier', verifier);

      const result = await signUp(email, password, challenge);

      if (result.redirect) {
        router.push(result.redirect);
      } else if (result.awaitingVerification) {
        setAwaitingVerification(true);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (awaitingVerification) {
    return (
      <div className="rounded-md border border-teal/30 bg-teal/10 px-4 py-3 text-sm text-text-primary">
        <p className="mb-1 font-medium text-teal">Check your email</p>
        <p className="text-text-secondary">
          We sent a verification link to confirm your account. Click it to
          finish signing up.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor={emailId}
          className="mb-1.5 block font-mono text-xs text-text-secondary"
        >
          EMAIL
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-teal"
        />
      </div>

      <div>
        <label
          htmlFor={passwordId}
          className="mb-1.5 block font-mono text-xs text-text-secondary"
        >
          PASSWORD
        </label>
        <div className="relative">
          <input
            id={passwordId}
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={9}
            className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 pr-10 text-sm text-text-primary outline-none focus:border-teal"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text-secondary"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-text-muted">Minimum 9 characters</p>
      </div>

      {error && (
        <div className="rounded-md border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          'mt-2 rounded-md bg-teal px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-teal-bright',
          isLoading && 'opacity-60',
        )}
      >
        {isLoading ? 'Signing up…' : 'Sign up'}
      </button>
    </form>
  );
}
