import { createNhostClient } from '@/lib/nhost/server';
import { Panel } from '@/components/ui/Panel';

export default async function Profile() {
  const nhost = await createNhostClient();
  const session = nhost.getUserSession();

  return (
    <div className="flex flex-1 items-center justify-center bg-bg p-6">
      <Panel className="w-full max-w-md p-8">
        <h1 className="mb-4 text-lg font-semibold text-text-primary">
          Profile
        </h1>

        <div className="flex flex-col gap-3 font-mono text-sm">
          <div>
            <span className="text-text-muted">EMAIL: </span>
            <span className="text-text-primary">
              {session?.user?.email ?? '—'}
            </span>
          </div>
          <div>
            <span className="text-text-muted">USER ID: </span>
            <span className="text-text-primary">
              {session?.user?.id ?? '—'}
            </span>
          </div>
          <div>
            <span className="text-text-muted">ROLES: </span>
            <span className="text-text-primary">
              {session?.user?.roles?.join(', ') ?? '—'}
            </span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
