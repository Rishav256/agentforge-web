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

const UPDATE_STEP = `
  mutation UpdateStep($stepId: uuid!, $config: jsonb!) {
    update_workflow_steps_by_pk(
      pk_columns: { id: $stepId }
      _set: { config: $config }
    ) {
      id
    }
  }
`;

interface UpdateStepResponse {
  update_workflow_steps_by_pk: { id: string } | null;
}

export async function updateStep(
  nhost: NhostClient,
  stepId: string,
  config: Record<string, unknown>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const response = await nhost.graphql.request<UpdateStepResponse>({
      query: UPDATE_STEP,
      variables: { stepId, config },
    });

    if (response.body.errors) {
      return {
        success: false,
        error: response.body.errors[0]?.message ?? 'Failed to update step',
      };
    }

    if (!response.body.data?.update_workflow_steps_by_pk) {
      return { success: false, error: 'No step returned after update' };
    }

    return { success: true };
  } catch (err) {
    console.error('[updateStep] Raw error:', err);
    return { success: false, error: 'Failed to update step' };
  }
}

const DELETE_STEP = `
  mutation DeleteStep($stepId: uuid!) {
    delete_workflow_steps_by_pk(id: $stepId) {
      id
    }
  }
`;

interface DeleteStepResponse {
  delete_workflow_steps_by_pk: { id: string } | null;
}

export async function deleteStep(
  nhost: NhostClient,
  stepId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const response = await nhost.graphql.request<DeleteStepResponse>({
      query: DELETE_STEP,
      variables: { stepId },
    });

    if (response.body.errors) {
      return {
        success: false,
        error: response.body.errors[0]?.message ?? 'Failed to delete step',
      };
    }

    if (!response.body.data?.delete_workflow_steps_by_pk) {
      return { success: false, error: 'Step not found or already deleted' };
    }

    return { success: true };
  } catch (err) {
    console.error('[deleteStep] Raw error:', err);
    return { success: false, error: 'Failed to delete step' };
  }
}
