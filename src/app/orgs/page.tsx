import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Panel } from '@/components/ui/Panel';
import { createNhostClient } from '@/lib/nhost/server';
import { getUserOrgs } from '@/lib/graphql/orgs';

export default async function OrgsPage() {
  const nhost = await createNhostClient();
  const orgs = await getUserOrgs(nhost);

  if (orgs.length === 1) {
    redirect(`/orgs/${orgs[0].id}/workflows`);
  }

  if (orgs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-bg p-6">
        <Panel className="w-full max-w-sm p-6 text-center">
          <p className="text-sm text-text-secondary">
            You&apos;re not a member of any organization yet.
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-bg p-6">
      <Panel className="w-full max-w-sm p-6">
        <h1 className="mb-4 text-lg font-semibold text-text-primary">
          Select organization
        </h1>
        <div className="flex flex-col gap-2">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/orgs/${org.id}/workflows`}
              className="flex items-center justify-between rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary transition-colors hover:border-teal"
            >
              <span>{org.name}</span>
              <span className="font-mono text-xs text-text-muted">
                {org.role.toUpperCase()}
              </span>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
