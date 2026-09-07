'use server';

import type { NhostClient } from '@nhost/nhost-js';
import { createNhostClient } from '@/lib/nhost/server';

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
