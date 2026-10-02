'use client';

import type { StepType } from '@/lib/graphql/workflow-steps';
import type { StepFieldState } from '@/lib/step-config';

interface StepConfigFieldsProps {
  type: StepType;
  fields: StepFieldState;
  onChange: (partial: Partial<StepFieldState>) => void;
}

const inputClass =
  'rounded-md border border-border bg-surface-elevated px-2 py-1 outline-none focus:border-teal';

export function StepConfigFields({
  type,
  fields,
  onChange,
}: StepConfigFieldsProps) {
  if (type === 'llm_call') {
    return (
      <label className="flex flex-col gap-1">
        Prompt
        <textarea
          value={fields.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
          className={inputClass}
        />
      </label>
    );
  }

  if (type === 'http_request') {
    return (
      <>
        <label className="flex flex-col gap-1">
          URL
          <input
            value={fields.url}
            onChange={(e) => onChange({ url: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          Method
          <select
            value={fields.method}
            onChange={(e) => onChange({ method: e.target.value })}
            className={inputClass}
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
            value={fields.body}
            onChange={(e) => onChange({ body: e.target.value })}
            placeholder='{"received": "{{previousOutput}}"}'
            className={inputClass}
          />
        </label>
      </>
    );
  }

  if (type === 'notify') {
    return (
      <>
        <label className="flex flex-col gap-1">
          URL
          <input
            value={fields.url}
            onChange={(e) => onChange({ url: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          Message (supports {'{{previousOutput}}'})
          <textarea
            value={fields.message}
            onChange={(e) => onChange({ message: e.target.value })}
            className={inputClass}
          />
        </label>
      </>
    );
  }

  if (type === 'db_write') {
    return (
      <>
        <label className="flex flex-col gap-1">
          Key
          <input
            value={fields.dbKey}
            onChange={(e) => onChange({ dbKey: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          Value (supports {'{{previousOutput}}'})
          <input
            value={fields.dbValue}
            onChange={(e) => onChange({ dbValue: e.target.value })}
            className={inputClass}
          />
        </label>
      </>
    );
  }

  if (type === 'conditional_branch') {
    return (
      <>
        <label className="flex flex-col gap-1">
          Field (from previous step&apos;s output)
          <input
            value={fields.field}
            onChange={(e) => onChange({ field: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          Value to compare against
          <input
            value={fields.value}
            onChange={(e) => onChange({ value: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          Jump to step # if false
          <input
            type="number"
            value={fields.jumpToStepOnFalse}
            onChange={(e) => onChange({ jumpToStepOnFalse: e.target.value })}
            className={inputClass}
          />
        </label>
      </>
    );
  }

  return (
    <p className="text-text-secondary">
      Pauses the run until manually approved. No config needed.
    </p>
  );
}
