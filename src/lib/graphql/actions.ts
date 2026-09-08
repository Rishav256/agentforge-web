import type { NhostClient } from '@nhost/nhost-js';

const TRIGGER_WORKFLOW_RUN = `
  mutation TriggerWorkflowRun($workflowId: uuid!) {
    triggerWorkflowRun(input: { workflow_id: $workflowId }) {
      run_id
      status
    }
  }
`;

interface TriggerWorkflowRunResponse {
  triggerWorkflowRun: { run_id: string; status: string };
}

export async function triggerWorkflowRun(
  nhost: NhostClient,
  workflowId: string,
): Promise<
  { success: true; runId: string } | { success: false; error: string }
> {
  try {
    const response = await nhost.graphql.request<TriggerWorkflowRunResponse>({
      query: TRIGGER_WORKFLOW_RUN,
      variables: { workflowId },
    });

    if (response.body.errors) {
      return {
        success: false,
        error: response.body.errors[0]?.message ?? 'Failed to trigger run',
      };
    }

    if (!response.body.data) {
      return { success: false, error: 'No data returned from trigger run' };
    }

    return {
      success: true,
      runId: response.body.data.triggerWorkflowRun.run_id,
    };
  } catch (err) {
    console.error('[triggerWorkflowRun] Raw error:', err);
    return { success: false, error: 'Failed to trigger run' };
  }
}

const APPROVE_STEP = `
  mutation ApproveStep($stepRunId: uuid!) {
    approveStep(input: { step_run_id: $stepRunId }) {
      status
      step_run_id
    }
  }
`;

interface ApproveStepResponse {
  approveStep: { status: string; step_run_id: string };
}

export async function approveStep(
  nhost: NhostClient,
  stepRunId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const response = await nhost.graphql.request<ApproveStepResponse>({
      query: APPROVE_STEP,
      variables: { stepRunId },
    });

    if (response.body.errors) {
      return {
        success: false,
        error: response.body.errors[0]?.message ?? 'Failed to approve step',
      };
    }

    if (!response.body.data) {
      return { success: false, error: 'No data returned from approve step' };
    }

    return { success: true };
  } catch (err) {
    console.error('[approveStep] Raw error:', err);
    return { success: false, error: 'Failed to approve step' };
  }
}
