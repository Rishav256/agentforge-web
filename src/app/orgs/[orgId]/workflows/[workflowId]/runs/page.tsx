import Link from 'next/link';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { createNhostClient } from '@/lib/nhost/server';
import { getWorkflowRuns } from '@/lib/graphql/runs';

export default async function RunsPage({
  params,
}: {
  params: Promise<{ orgId: string; workflowId: string }>;
}) {
  const { orgId, workflowId } = await params;
  const nhost = await createNhostClient();
  const runs = await getWorkflowRuns(nhost, workflowId);

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">Runs</h1>
        <Link
          href={`/orgs/${orgId}/workflows/${workflowId}`}
          className="font-mono text-xs text-text-secondary hover:text-teal"
        >
          ← Back to canvas
        </Link>
      </div>

      {runs.length === 0 ? (
        <Panel className="p-6 text-center">
          <p className="text-sm text-text-secondary">No runs yet.</p>
        </Panel>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run) => (
            <Link
              key={run.id}
              href={`/orgs/${orgId}/workflows/${workflowId}/runs/${run.id}`}
              className="flex items-center justify-between rounded-md border border-border bg-surface p-4 transition-colors hover:border-teal"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-text-muted">
                  {run.id.slice(0, 8)}
                </span>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <StatusBadge status={run.status as any} />
              </div>
              <span className="font-mono text-xs text-text-secondary">
                {run.startedAt
                  ? new Date(run.startedAt).toLocaleString()
                  : 'Not started'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
