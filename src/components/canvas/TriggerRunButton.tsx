'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { triggerRun } from '@/app/orgs/[orgId]/workflows/[workflowId]/actions';

interface TriggerRunButtonProps {
  orgId: string;
  workflowId: string;
}

export function TriggerRunButton({ orgId, workflowId }: TriggerRunButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleTrigger = async () => {
    setIsLoading(true);
    setError(null);

    const result = await triggerRun(workflowId);

    if (result.success) {
      router.push(
        `/orgs/${orgId}/workflows/${workflowId}/runs/${result.runId}`,
      );
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red">{error}</span>}
      <button
        onClick={handleTrigger}
        disabled={isLoading}
        className={cn(
          'rounded-md bg-teal px-3 py-1.5 text-xs font-medium text-bg transition-colors hover:bg-teal-bright',
          isLoading && 'opacity-60',
        )}
      >
        {isLoading ? 'Starting…' : '▶ Run'}
      </button>
    </div>
  );
}
