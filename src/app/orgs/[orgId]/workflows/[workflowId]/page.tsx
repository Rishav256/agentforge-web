import { notFound } from 'next/navigation';
import { createNhostClient } from '@/lib/nhost/server';
import { getWorkflowDetail } from '@/lib/graphql/workflow-detail';
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas';

export default async function WorkflowBuilderPage({
  params,
}: {
  params: Promise<{ orgId: string; workflowId: string }>;
}) {
  const { workflowId } = await params;
  const nhost = await createNhostClient();
  const workflow = await getWorkflowDetail(nhost, workflowId);

  if (!workflow) {
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-49px)] w-full flex-col">
      <div className="border-b border-border px-6 py-3">
        <h1 className="text-sm font-semibold text-text-primary">
          {workflow.name}
        </h1>
      </div>
      <div className="flex-1">
        <WorkflowCanvas steps={workflow.steps} />
      </div>
    </div>
  );
}
