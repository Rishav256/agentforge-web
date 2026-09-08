'use server';

import { createNhostClient } from '@/lib/nhost/server';
import { approveStep } from '@/lib/graphql/actions';

export async function approveStepAction(stepRunId: string) {
  const nhost = await createNhostClient();
  return approveStep(nhost, stepRunId);
}
