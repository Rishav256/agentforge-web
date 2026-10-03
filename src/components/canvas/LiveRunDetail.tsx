'use client';

import { useEffect, useState } from 'react';
import { createClient as createWsClient } from 'graphql-ws';
import Link from 'next/link';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ApproveStepButton } from '@/components/canvas/ApproveStepButton';
import {
  isValidStatus,
  RUN_DETAIL_SUBSCRIPTION,
  type RunDetail,
} from '@/lib/graphql/runs';
import { getBrowserAccessToken } from '@/lib/nhost/browser-token';

interface LiveRunDetailProps {
  initialRun: RunDetail;
  runId: string;
  orgId: string;
  workflowId: string;
  wsUrl: string;
}

interface RunDetailSubscriptionResponse {
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

export function LiveRunDetail({
  initialRun,
  runId,
  orgId,
  workflowId,
  wsUrl,
}: LiveRunDetailProps) {
  const [run, setRun] = useState<RunDetail>(initialRun);

  useEffect(() => {
    const token = getBrowserAccessToken();

    const client = createWsClient({
      url: wsUrl,
      connectionParams: token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {},
    });

    const unsubscribe = client.subscribe<RunDetailSubscriptionResponse>(
      {
        query: RUN_DETAIL_SUBSCRIPTION,
        variables: { runId },
      },
      {
        next: ({ data }) => {
          const updated = data?.workflow_runs_by_pk;
          if (!updated) return;

          setRun({
            id: updated.id,
            status: updated.status,
            startedAt: updated.started_at,
            completedAt: updated.completed_at,
            triggerType: updated.trigger_type,
            stepRuns: updated.step_runs.map((sr) => ({
              id: sr.id,
              status: sr.status,
              startedAt: sr.started_at,
              completedAt: sr.completed_at,
              error: sr.error,
              stepType: sr.workflow_step.type,
              stepOrder: sr.workflow_step.step_order,
            })),
          });
        },
        error: (err) => {
          console.error('[LiveRunDetail] Subscription error:', err);
        },
        complete: () => {},
      },
    );

    return () => {
      unsubscribe();
      client.dispose();
    };
  }, [runId, wsUrl]);

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-sm text-text-secondary">
            RUN {run.id.slice(0, 8)}
          </h1>
          {isValidStatus(run.status) ? (
            <StatusBadge status={run.status} />
          ) : (
            <span className="font-mono text-xs text-red">{run.status}</span>
          )}
        </div>
        <Link
          href={`/orgs/${orgId}/workflows/${workflowId}/runs`}
          className="font-mono text-xs text-text-secondary hover:text-teal"
        >
          ← Back to runs
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {run.stepRuns.map((sr) => (
          <Panel key={sr.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-text-muted">
                {String(sr.stepOrder).padStart(2, '0')}
              </span>
              <span className="font-mono text-xs text-text-primary">
                {sr.stepType.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {sr.error && (
                <span className="max-w-xs truncate text-xs text-red">
                  {sr.error}
                </span>
              )}
              {sr.status === 'paused' && (
                <ApproveStepButton stepRunId={sr.id} />
              )}
              {isValidStatus(sr.status) ? (
                <StatusBadge status={sr.status} />
              ) : (
                <span className="font-mono text-xs text-red">{sr.status}</span>
              )}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
