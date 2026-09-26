import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { createNhostClient } from '@/lib/nhost/server';
import { getWorkflowRuns, isValidStatus } from '@/lib/graphql/runs';

export default async function RunsListPage({
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
        <h1 className="font-mono text-sm text-text-secondary">RUNS</h1>
        <Link
          href={`/orgs/${orgId}/workflows/${workflowId}`}
          className="font-mono text-xs text-text-secondary hover:text-teal"
        >
          ← Back to workflow
        </Link>
      </div>

      {runs.length === 0 ? (
        <p className="font-mono text-xs text-text-muted">No runs yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run) => (
            <Link
              key={run.id}
              href={`/orgs/${orgId}/workflows/${workflowId}/runs/${run.id}`}
              className="flex items-center justify-between rounded-md border border-border bg-surface-elevated p-4 hover:border-teal"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-text-muted">
                  {run.id.slice(0, 8)}
                </span>
                <span className="font-mono text-xs text-text-secondary">
                  {run.triggerType}
                </span>
              </div>
              {isValidStatus(run.status) ? (
                <StatusBadge status={run.status} />
              ) : (
                <span className="font-mono text-xs text-red">{run.status}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
