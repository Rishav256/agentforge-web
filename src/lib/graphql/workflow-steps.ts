import type { NhostClient } from '@nhost/nhost-js';

export type StepType =
  | 'llm_call'
  | 'http_request'
  | 'notify'
  | 'db_write'
  | 'conditional_branch'
  | 'approval_gate';

const GET_MAX_STEP_ORDER = `
  query GetMaxStepOrder($workflowId: uuid!) {
    workflow_steps(
      where: { workflow_id: { _eq: $workflowId } }
      order_by: { step_order: desc }
      limit: 1
    ) {
      step_order
    }
  }
`;

interface GetMaxStepOrderResponse {
  workflow_steps: Array<{ step_order: number }>;
}

const CREATE_STEP = `
  mutation CreateStep(
    $workflowId: uuid!
    $type: step_type!
    $stepOrder: Int!
    $config: jsonb!
  ) {
    insert_workflow_steps_one(
      object: {
        workflow_id: $workflowId
        type: $type
        step_order: $stepOrder
        config: $config
      }
    ) {
      id
    }
  }
`;

interface CreateStepResponse {
  insert_workflow_steps_one: { id: string } | null;
}

export async function createStep(
  nhost: NhostClient,
  workflowId: string,
  type: StepType,
  config: Record<string, unknown>,
): Promise<
  { success: true; stepId: string } | { success: false; error: string }
> {
  try {
    const maxResponse = await nhost.graphql.request<GetMaxStepOrderResponse>({
      query: GET_MAX_STEP_ORDER,
      variables: { workflowId },
    });

    if (maxResponse.body.errors) {
      return {
        success: false,
        error:
          maxResponse.body.errors[0]?.message ??
          'Failed to determine step order',
      };
    }

    const currentMax =
      maxResponse.body.data?.workflow_steps?.[0]?.step_order ?? 0;
    const nextOrder = currentMax + 1;

    const response = await nhost.graphql.request<CreateStepResponse>({
      query: CREATE_STEP,
      variables: { workflowId, type, stepOrder: nextOrder, config },
    });

    if (response.body.errors) {
      return {
        success: false,
        error: response.body.errors[0]?.message ?? 'Failed to create step',
      };
    }

    if (!response.body.data?.insert_workflow_steps_one) {
      return { success: false, error: 'No step returned after creation' };
    }

    return {
      success: true,
      stepId: response.body.data.insert_workflow_steps_one.id,
    };
  } catch (err) {
    console.error('[createStep] Raw error:', err);
    return { success: false, error: 'Failed to create step' };
  }
}
