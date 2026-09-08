'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { approveStepAction } from '@/app/orgs/[orgId]/workflows/[workflowId]/runs/[runId]/actions';

interface ApproveStepButtonProps {
  stepRunId: string;
}

export function ApproveStepButton({ stepRunId }: ApproveStepButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);

    const result = await approveStepAction(stepRunId);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red">{error}</span>}
      <button
        onClick={handleApprove}
        disabled={isLoading}
        className={cn(
          'rounded-md bg-amber px-3 py-1.5 text-xs font-medium text-bg transition-colors hover:brightness-110',
          isLoading && 'opacity-60',
        )}
      >
        {isLoading ? 'Approving…' : 'Approve'}
      </button>
    </div>
  );
}
