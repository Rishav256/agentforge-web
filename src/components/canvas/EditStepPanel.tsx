'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  updateStepAction,
  deleteStepAction,
} from '@/app/orgs/[orgId]/workflows/[workflowId]/actions';
import type { StepType } from '@/lib/graphql/workflow-steps';
import { fieldsFromConfig, buildStepConfig } from '@/lib/step-config';
import { StepConfigFields } from './StepConfigFields';

interface EditStepPanelProps {
  stepId: string;
  stepOrder: number;
  type: StepType;
  config: Record<string, unknown>;
  referencedByStepOrders: number[];
  onClose: () => void;
}

export function EditStepPanel({
  stepId,
  stepOrder,
  type,
  config,
  referencedByStepOrders,
  onClose,
}: EditStepPanelProps) {
  const [fields, setFields] = useState(() => fieldsFromConfig(type, config));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setError(null);

    const built = buildStepConfig(type, fields);
    if (!built.success) {
      setError(built.error);
      return;
    }

    setIsLoading(true);
    const result = await updateStepAction(stepId, built.config);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error ?? 'Failed to update step');
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setError(null);
    setIsLoading(true);

    const result = await deleteStepAction(stepId);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error ?? 'Failed to delete step');
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute right-4 top-4 z-10 flex w-72 flex-col gap-2 rounded-md border border-border bg-surface-elevated p-3 text-xs shadow-lg">
      <div className="flex items-center justify-between">
        <span className="font-mono font-medium text-text-primary">
          EDIT {type.toUpperCase()}
        </span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary"
        >
          ✕
        </button>
      </div>

      {error && <span className="text-red">{error}</span>}

      {!confirmingDelete && (
        <>
          <StepConfigFields
            type={type}
            fields={fields}
            onChange={(partial) => setFields((f) => ({ ...f, ...partial }))}
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={cn(
                'rounded-md bg-teal px-3 py-1.5 text-xs font-medium text-bg transition-colors hover:bg-teal-bright',
                isLoading && 'opacity-60',
              )}
            >
              {isLoading ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-teal"
            >
              Cancel
            </button>
          </div>

          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-1 self-start text-red hover:underline"
          >
            Delete step
          </button>
        </>
      )}

      {confirmingDelete && (
        <div className="flex flex-col gap-2">
          <p className="text-text-primary">
            Delete step {String(stepOrder).padStart(2, '0')} ({type})? This
            can&apos;t be undone.
          </p>

          {referencedByStepOrders.length > 0 && (
            <p className="text-amber">
              ⚠ Step{referencedByStepOrders.length > 1 ? 's' : ''}{' '}
              {referencedByStepOrders
                .map((n) => String(n).padStart(2, '0'))
                .join(', ')}{' '}
              branch to this step on false. Deleting it will leave{' '}
              {referencedByStepOrders.length > 1
                ? 'those branches'
                : 'that branch'}{' '}
              pointing nowhere.
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className={cn(
                'rounded-md bg-red px-3 py-1.5 text-xs font-medium text-bg transition-colors hover:brightness-110',
                isLoading && 'opacity-60',
              )}
            >
              {isLoading ? 'Deleting…' : 'Confirm delete'}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-teal"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
