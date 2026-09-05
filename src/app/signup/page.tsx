import Link from 'next/link';
import { Panel } from '@/components/ui/Panel';
import SignUpForm from './SignUpForm';

export default function SignUp() {
  return (
    <div className="flex flex-1 items-center justify-center bg-bg p-6">
      <Panel className="w-full max-w-sm p-8">
        <h1 className="mb-1 text-lg font-semibold text-text-primary">
          Sign up
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          AgentForge Control Station
        </p>

        <SignUpForm />

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/signin" className="text-teal hover:text-teal-bright">
            Sign in
          </Link>
        </p>
      </Panel>
    </div>
  );
}
