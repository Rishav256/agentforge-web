import type { NhostClient } from '@nhost/nhost-js';
import type { Status } from '@/components/ui/StatusBadge';

export function isValidStatus(status: string): status is Status {
  return [
    'pending',
    'running',
    'paused',
    'completed',
    'succeeded',
    'failed',
    'skipped',
  ].includes(status);
}

export interface RunListItem {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  triggerType: string;
}

export interface StepRunDetail {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  stepType: string;
  stepOrder: number;
}

export interface RunDetail {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  triggerType: string;
  stepRuns: StepRunDetail[];
}

const GET_WORKFLOW_RUNS = `
  query GetWorkflowRuns($workflowId: uuid!) {
    workflow_runs(
      where: { workflow_id: { _eq: $workflowId } }
      order_by: { created_at: desc }
    ) {
      id
      status
      started_at
      completed_at
      trigger_type
    }
  }
`;

interface GetWorkflowRunsResponse {
  workflow_runs: Array<{
    id: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    trigger_type: string;
  }>;
}

export async function getWorkflowRuns(
  nhost: NhostClient,
  workflowId: string,
): Promise<RunListItem[]> {
  const response = await nhost.graphql.request<GetWorkflowRunsResponse>({
    query: GET_WORKFLOW_RUNS,
    variables: { workflowId },
  });

  if (response.body.errors) {
    throw new Error(response.body.errors[0]?.message ?? 'Failed to fetch runs');
  }

  return (response.body.data?.workflow_runs ?? []).map((r) => ({
    id: r.id,
    status: r.status,
    startedAt: r.started_at,
    completedAt: r.completed_at,
    triggerType: r.trigger_type,
  }));
}

const GET_RUN_DETAIL = `
  query GetRunDetail($runId: uuid!) {
    workflow_runs_by_pk(id: $runId) {
      id
      status
      started_at
      completed_at
      trigger_type
      step_runs(order_by: { workflow_step: { step_order: asc } }) {
        id
        status
        started_at
        completed_at
        error
        workflow_step {
          type
          step_order
        }
      }
    }
  }
`;

interface GetRunDetailResponse {
  workflow_runs_by_pk: {
    id: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    trigger_type: string;
    step_runs: Array<{
      id: string;
      status: string;
      started_at: string | null;
      completed_at: string | null;
      error: string | null;
      workflow_step: { type: string; step_order: number };
    }>;
  } | null;
}

export async function getRunDetail(
  nhost: NhostClient,
  runId: string,
): Promise<RunDetail | null> {
  const response = await nhost.graphql.request<GetRunDetailResponse>({
    query: GET_RUN_DETAIL,
    variables: { runId },
  });

  if (response.body.errors) {
    throw new Error(response.body.errors[0]?.message ?? 'Failed to fetch run');
  }

  const run = response.body.data?.workflow_runs_by_pk;
  if (!run) return null;

  return {
    id: run.id,
    status: run.status,
    startedAt: run.started_at,
    completedAt: run.completed_at,
    triggerType: run.trigger_type,
    stepRuns: run.step_runs.map((sr) => ({
      id: sr.id,
      status: sr.status,
      startedAt: sr.started_at,
      completedAt: sr.completed_at,
      error: sr.error,
      stepType: sr.workflow_step.type,
      stepOrder: sr.workflow_step.step_order,
    })),
  };
}
