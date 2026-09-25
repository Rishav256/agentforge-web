'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createWorkflowAction } from '@/app/orgs/[orgId]/workflows/actions';

interface CreateWorkflowButtonProps {
  orgId: string;
}

export function CreateWorkflowButton({ orgId }: CreateWorkflowButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await createWorkflowAction(orgId, name.trim());

    if (result.success) {
      router.push(`/orgs/${orgId}/workflows/${result.workflowId}`);
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-teal px-3 py-1.5 text-xs font-medium text-bg transition-colors hover:bg-teal-bright"
      >
        + New workflow
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red">{error}</span>}
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCreate();
          if (e.key === 'Escape') setIsOpen(false);
        }}
        placeholder="Workflow name"
        className="rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary outline-none focus:border-teal"
      />
      <button
        onClick={handleCreate}
        disabled={isLoading}
        className={cn(
          'rounded-md bg-teal px-3 py-1.5 text-xs font-medium text-bg transition-colors hover:bg-teal-bright',
          isLoading && 'opacity-60',
        )}
      >
        {isLoading ? 'Creating…' : 'Create'}
      </button>
    </div>
  );
}
