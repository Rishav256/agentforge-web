import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createNhostClient } from '@/lib/nhost/server';
import { getWorkflowDetail } from '@/lib/graphql/workflow-detail';
import { getOrgIfMember } from '@/lib/graphql/orgs';
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas';
import { TriggerRunButton } from '@/components/canvas/TriggerRunButton';

export default async function WorkflowBuilderPage({
  params,
}: {
  params: Promise<{ orgId: string; workflowId: string }>;
}) {
  const { orgId, workflowId } = await params;
  const nhost = await createNhostClient();

  const [workflow, org] = await Promise.all([
    getWorkflowDetail(nhost, workflowId),
    getOrgIfMember(nhost, orgId),
  ]);

  if (!workflow || !org) {
    notFound();
  }

  const canTrigger = org.role === 'owner' || org.role === 'editor';

  return (
    <div className="flex h-[calc(100vh-49px)] w-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <h1 className="text-sm font-semibold text-text-primary">
          {workflow.name}
        </h1>
        <div className="flex items-center gap-4">
          {canTrigger && (
            <TriggerRunButton orgId={orgId} workflowId={workflowId} />
          )}
          <Link
            href={`/orgs/${orgId}/workflows/${workflowId}/runs`}
            className="font-mono text-xs text-text-secondary hover:text-teal"
          >
            View runs →
          </Link>
        </div>
      </div>
      <div className="flex-1">
        <WorkflowCanvas steps={workflow.steps} />
      </div>
    </div>
  );
}
