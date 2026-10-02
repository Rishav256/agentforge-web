'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createStepAction } from '@/app/orgs/[orgId]/workflows/[workflowId]/actions';
import type { StepType } from '@/lib/graphql/workflow-steps';
import { emptyStepFields, buildStepConfig } from '@/lib/step-config';
import { StepConfigFields } from './StepConfigFields';

interface AddStepButtonProps {
  workflowId: string;
}

const STEP_TYPES: { value: StepType; label: string }[] = [
  { value: 'llm_call', label: 'LLM Call' },
  { value: 'http_request', label: 'HTTP Request' },
  { value: 'notify', label: 'Notify' },
  { value: 'db_write', label: 'DB Write' },
  { value: 'conditional_branch', label: 'Conditional Branch' },
  { value: 'approval_gate', label: 'Approval Gate' },
];

export function AddStepButton({ workflowId }: AddStepButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<StepType>('llm_call');
  const [fields, setFields] = useState(emptyStepFields);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async () => {
    setError(null);

    const built = buildStepConfig(type, fields);
    if (!built.success) {
      setError(built.error);
      return;
    }

    setIsLoading(true);
    const result = await createStepAction(workflowId, type, built.config);

    if (result.success) {
      setIsOpen(false);
      setFields(emptyStepFields);
      router.refresh();
    } else {
      setError(result.error ?? 'Failed to create step');
    }
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-teal px-3 py-1.5 text-xs font-medium text-bg transition-colors hover:bg-teal-bright"
      >
        + Add step
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-elevated p-3 text-xs">
      {error && <span className="text-red">{error}</span>}

      <label className="flex flex-col gap-1">
        Step type
        <select
          value={type}
          onChange={(e) => setType(e.target.value as StepType)}
          className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
        >
          {STEP_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <StepConfigFields
        type={type}
        fields={fields}
        onChange={(partial) => setFields((f) => ({ ...f, ...partial }))}
      />

      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          disabled={isLoading}
          className={cn(
            'rounded-md bg-teal px-3 py-1.5 text-xs font-medium text-bg transition-colors hover:bg-teal-bright',
            isLoading && 'opacity-60',
          )}
        >
          {isLoading ? 'Creating…' : 'Create step'}
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-teal"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
