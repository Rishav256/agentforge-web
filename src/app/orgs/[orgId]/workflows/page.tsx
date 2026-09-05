import Link from 'next/link';
import { Panel } from '@/components/ui/Panel';
import { createNhostClient } from '@/lib/nhost/server';
import { getOrgWorkflows } from '@/lib/graphql/workflows';

export default async function WorkflowsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const nhost = await createNhostClient();
  const workflows = await getOrgWorkflows(nhost, orgId);

  return (
    <div className="flex flex-1 flex-col p-6">
      <h1 className="mb-4 text-lg font-semibold text-text-primary">
        Workflows
      </h1>

      {workflows.length === 0 ? (
        <Panel className="p-6 text-center">
          <p className="text-sm text-text-secondary">
            No workflows yet in this organization.
          </p>
        </Panel>
      ) : (
        <div className="flex flex-col gap-2">
          {workflows.map((wf) => (
            <Link
              key={wf.id}
              href={`/orgs/${orgId}/workflows/${wf.id}`}
              className="flex items-center justify-between rounded-md border border-border bg-surface p-4 transition-colors hover:border-teal"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {wf.name}
                </p>
                <p className="font-mono text-xs text-text-muted">
                  {wf.stepCount} step{wf.stepCount !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="font-mono text-xs text-text-secondary">
                {new Date(wf.createdAt).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
