import { notFound } from 'next/navigation';
import { createNhostClient } from '@/lib/nhost/server';
import { getRunDetail } from '@/lib/graphql/runs';
import { getGraphqlWsUrl } from '@/lib/nhost/ws-url';
import { LiveRunDetail } from '@/components/canvas/LiveRunDetail';

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

  const wsUrl = getGraphqlWsUrl(
    process.env['NHOST_REGION'] || 'local',
    process.env['NHOST_SUBDOMAIN'] || 'local',
  );

  return (
    <LiveRunDetail
      initialRun={run}
      runId={runId}
      orgId={orgId}
      workflowId={workflowId}
      wsUrl={wsUrl}
    />
  );
}
