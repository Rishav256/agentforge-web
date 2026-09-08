import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ApproveStepButton } from '@/components/canvas/ApproveStepButton';
import { createNhostClient } from '@/lib/nhost/server';
import { getRunDetail, isValidStatus } from '@/lib/graphql/runs';

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; workflowId: string; runId: string }>;
}) {
  const { orgId, workflowId, runId } = await params;
  const nhost = await createNhostClient();
  const run = await getRunDetail(nhost, runId);

  if (!run) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-sm text-text-secondary">
            RUN {run.id.slice(0, 8)}
          </h1>
          {isValidStatus(run.status) ? (
            <StatusBadge status={run.status} />
          ) : (
            <span className="font-mono text-xs text-red">{run.status}</span>
          )}
        </div>
        <Link
          href={`/orgs/${orgId}/workflows/${workflowId}/runs`}
          className="font-mono text-xs text-text-secondary hover:text-teal"
        >
          ← Back to runs
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {run.stepRuns.map((sr) => (
          <Panel key={sr.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-text-muted">
                {String(sr.stepOrder).padStart(2, '0')}
              </span>
              <span className="font-mono text-xs text-text-primary">
                {sr.stepType.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {sr.error && (
                <span className="max-w-xs truncate text-xs text-red">
                  {sr.error}
                </span>
              )}
              {sr.status === 'paused' && (
                <ApproveStepButton stepRunId={sr.id} />
              )}
              {isValidStatus(sr.status) ? (
                <StatusBadge status={sr.status} />
              ) : (
                <span className="font-mono text-xs text-red">{sr.status}</span>
              )}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
