'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signIn } from './actions';

interface SignInFormProps {
  initialError?: string;
}

export default function SignInForm({ initialError }: SignInFormProps) {
  const [error, setError] = useState<string | undefined>(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const emailId = useId();
  const passwordId = useId();

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await signIn(formData);

      if (result.redirect) {
        router.push(result.redirect);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
