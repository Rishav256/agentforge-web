import type { NhostClient } from '@nhost/nhost-js';

export interface WorkflowListItem {
  id: string;
  name: string;
  createdAt: string;
  stepCount: number;
}

const GET_ORG_WORKFLOWS = `
  query GetOrgWorkflows($orgId: uuid!) {
    workflows(
      where: { org_id: { _eq: $orgId } }
      order_by: { created_at: desc }
    ) {
      id
      name
      created_at
      workflow_steps {
        id
      }
    }
  }
`;

interface GetOrgWorkflowsResponse {
  workflows: Array<{
    id: string;
    name: string;
    created_at: string;
    workflow_steps: Array<{ id: string }>;
  }>;
}

export async function getOrgWorkflows(
  nhost: NhostClient,
  orgId: string,
): Promise<WorkflowListItem[]> {
  const response = await nhost.graphql.request<GetOrgWorkflowsResponse>({
    query: GET_ORG_WORKFLOWS,
    variables: { orgId },
  });

  if (response.body.errors) {
    throw new Error(
      response.body.errors[0]?.message ?? 'Failed to fetch workflows',
    );
  }

  const workflows = response.body.data?.workflows ?? [];

  return workflows.map((w) => ({
    id: w.id,
    name: w.name,
    createdAt: w.created_at,
    stepCount: w.workflow_steps.length,
  }));
}
