'use server';

import type { NhostClient } from '@nhost/nhost-js';
import { createNhostClient } from '@/lib/nhost/server';
import { triggerWorkflowRun as triggerWorkflowRunQuery } from '@/lib/graphql/actions';
import { createStep, type StepType } from '@/lib/graphql/workflow-steps';

const UPDATE_STEP_POSITION = `
  mutation UpdateStepPosition($stepId: uuid!, $position: jsonb!) {
    update_workflow_steps_by_pk(
      pk_columns: { id: $stepId }
      _set: { position: $position }
    ) {
      id
    }
  }
`;

export async function updateStepPosition(
  stepId: string,
  position: { x: number; y: number },
): Promise<{ success: boolean; error?: string }> {
  try {
    const nhost: NhostClient = await createNhostClient();
    const response = await nhost.graphql.request({
      query: UPDATE_STEP_POSITION,
      variables: { stepId, position },
    });

    if (response.body.errors) {
      return {
        success: false,
        error: response.body.errors[0]?.message ?? 'Update failed',
      };
    }
    return { success: true };
  } catch (err) {
    console.error('[updateStepPosition] Raw error:', err);
    return { success: false, error: 'Failed to save position' };
  }
}

export async function triggerRun(workflowId: string) {
  console.log('[triggerRun] workflowId received:', workflowId);
  const nhost = await createNhostClient();
  return triggerWorkflowRunQuery(nhost, workflowId);
}

export async function createStepAction(
  workflowId: string,
  type: StepType,
  config: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  const nhost = await createNhostClient();
  return createStep(nhost, workflowId, type, config);
}
