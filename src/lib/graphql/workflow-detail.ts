import type { NhostClient } from '@nhost/nhost-js';

export interface WorkflowStep {
  id: string;
  type: string;
  stepOrder: number;
  config: Record<string, unknown>;
  position: { x: number; y: number } | null;
}

export interface WorkflowDetail {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

const GET_WORKFLOW_DETAIL = `
  query GetWorkflowDetail($workflowId: uuid!) {
    workflows_by_pk(id: $workflowId) {
      id
      name
      workflow_steps(order_by: { step_order: asc }) {
        id
        type
        step_order
        config
        position
      }
    }
  }
`;

interface GetWorkflowDetailResponse {
  workflows_by_pk: {
    id: string;
    name: string;
    workflow_steps: Array<{
      id: string;
      type: string;
      step_order: number;
      config: Record<string, unknown>;
      position: { x: number; y: number } | null;
    }>;
  } | null;
}

export async function getWorkflowDetail(
  nhost: NhostClient,
  workflowId: string,
): Promise<WorkflowDetail | null> {
  const response = await nhost.graphql.request<GetWorkflowDetailResponse>({
    query: GET_WORKFLOW_DETAIL,
    variables: { workflowId },
  });

  if (response.body.errors) {
    throw new Error(
      response.body.errors[0]?.message ?? 'Failed to fetch workflow',
    );
  }

  const wf = response.body.data?.workflows_by_pk;
  if (!wf) return null;

  return {
    id: wf.id,
    name: wf.name,
    steps: wf.workflow_steps.map((s) => ({
      id: s.id,
      type: s.type,
      stepOrder: s.step_order,
      config: s.config,
      position: s.position,
    })),
  };
}
