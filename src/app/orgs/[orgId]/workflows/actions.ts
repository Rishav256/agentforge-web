'use server';

import { createNhostClient } from '@/lib/nhost/server';
import { createWorkflow as createWorkflowQuery } from '@/lib/graphql/workflows';

export async function createWorkflowAction(orgId: string, name: string) {
  const nhost = await createNhostClient();
  return createWorkflowQuery(nhost, orgId, name);
}
