'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createStepAction } from '@/app/orgs/[orgId]/workflows/[workflowId]/actions';
import type { StepType } from '@/lib/graphql/workflow-steps';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('POST');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [jumpToStepOnFalse, setJumpToStepOnFalse] = useState('');
  const [dbKey, setDbKey] = useState('');
  const [dbValue, setDbValue] = useState('');

  const handleCreate = async () => {
    setError(null);

    let config: Record<string, unknown> = {};
    try {
      switch (type) {
        case 'llm_call':
          config = { prompt };
          break;
        case 'http_request':
          config = {
            url,
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.parse(body) : {},
          };
          break;
        case 'notify':
          config = { url, message };
          break;
        case 'db_write':
          config = { key: dbKey, value: dbValue };
          break;
        case 'conditional_branch': {
          const jumpTarget = Number(jumpToStepOnFalse);
          if (!jumpToStepOnFalse || Number.isNaN(jumpTarget)) {
            setError(
              'Jump-to-step number is required for conditional branches',
            );
            return;
          }
          config = {
            field,
            operator: 'equals',
            value: value === 'true' ? true : value === 'false' ? false : value,
            jumpToStepOnFalse: jumpTarget,
          };
          break;
        }
        case 'approval_gate':
          config = {};
          break;
      }
    } catch {
      setError('Invalid JSON in body field');
      return;
    }

    setIsLoading(true);
    const result = await createStepAction(workflowId, type, config);

    if (result.success) {
      setIsOpen(false);
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

      {type === 'llm_call' && (
        <label className="flex flex-col gap-1">
          Prompt
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
          />
        </label>
      )}

      {type === 'http_request' && (
        <>
          <label className="flex flex-col gap-1">
            URL
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
            />
          </label>
          <label className="flex flex-col gap-1">
            Method
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Body (JSON — supports {'{{previousOutput}}'})
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"received": "{{previousOutput}}"}'
              className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
            />
          </label>
        </>
      )}

      {type === 'notify' && (
        <>
          <label className="flex flex-col gap-1">
            URL
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
            />
          </label>
          <label className="flex flex-col gap-1">
            Message (supports {'{{previousOutput}}'})
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
            />
          </label>
        </>
      )}

      {type === 'db_write' && (
        <>
          <label className="flex flex-col gap-1">
            Key
            <input
              value={dbKey}
              onChange={(e) => setDbKey(e.target.value)}
              className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
            />
          </label>
          <label className="flex flex-col gap-1">
            Value (supports {'{{previousOutput}}'})
            <input
              value={dbValue}
              onChange={(e) => setDbValue(e.target.value)}
              className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
            />
          </label>
        </>
      )}

      {type === 'conditional_branch' && (
        <>
          <label className="flex flex-col gap-1">
            Field (from previous step&apos;s output)
            <input
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
            />
          </label>
          <label className="flex flex-col gap-1">
            Value to compare against
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
            />
          </label>
          <label className="flex flex-col gap-1">
            Jump to step # if false
            <input
              type="number"
              value={jumpToStepOnFalse}
              onChange={(e) => setJumpToStepOnFalse(e.target.value)}
              className="rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal"
            />
          </label>
        </>
      )}

      {type === 'approval_gate' && (
        <p className="text-text-secondary">
          Pauses the run until manually approved. No config needed.
        </p>
      )}

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
