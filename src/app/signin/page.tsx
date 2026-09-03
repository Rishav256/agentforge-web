import Link from 'next/link';
import { Panel } from '@/components/ui/Panel';
import SignInForm from './SignInForm';

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="flex flex-1 items-center justify-center bg-bg p-6">
      <Panel className="w-full max-w-sm p-8">
        <h1 className="mb-1 text-lg font-semibold text-text-primary">
          Sign in
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          AgentForge Control Station
        </p>

        <SignInForm initialError={error} />

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-teal hover:text-teal-bright">
            Sign up
          </Link>
        </p>
      </Panel>
    </div>
  );
}
