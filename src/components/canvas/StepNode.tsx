import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { cn } from '@/lib/utils';

export type StepNodeData = {
  type: string;
  stepOrder: number;
  config: Record<string, unknown>;
};

export type StepNodeType = Node<StepNodeData, 'step'>;

const TYPE_ACCENT: Record<string, string> = {
  llm_call: 'border-violet-500/50 text-violet-400',
  approval_gate: 'border-amber/50 text-amber',
  http_request: 'border-teal/50 text-teal',
  notify: 'border-teal/50 text-teal',
  conditional_branch: 'border-teal/50 text-teal',
  db_write: 'border-teal/50 text-teal',
};

function getStepSummary(type: string, config: Record<string, unknown>): string {
  switch (type) {
    case 'llm_call':
      return typeof config.prompt === 'string'
        ? config.prompt.slice(0, 40)
        : 'LLM call';
    case 'http_request':
      return typeof config.url === 'string' ? config.url : 'HTTP request';
    case 'notify':
      return typeof config.message === 'string'
        ? config.message.slice(0, 40)
        : 'Notify';
    case 'db_write':
      return typeof config.key === 'string'
        ? `Write: ${config.key}`
        : 'Write to output';
    case 'conditional_branch':
      return typeof config.field === 'string'
        ? `Check: ${config.field}`
        : 'Conditional';
    case 'approval_gate':
      return 'Awaiting human approval';
    default:
      return '';
  }
}

export function StepNode({ data }: NodeProps<StepNodeType>) {
  const accent = TYPE_ACCENT[data.type] ?? 'border-border text-text-secondary';
  const summary = getStepSummary(data.type, data.config);

  return (
    <div
      className={cn(
        'w-56 rounded-md border bg-surface px-4 py-3 shadow-sm',
        accent,
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-border" />

      <div className="mb-1 flex items-center justify-between font-mono text-xs">
        <span className="text-text-muted">
          {String(data.stepOrder).padStart(2, '0')}
        </span>
        <span className={cn('font-medium', accent.split(' ')[1])}>
          {data.type.toUpperCase()}
        </span>
      </div>

      {summary && (
        <p className="truncate text-xs text-text-secondary">{summary}</p>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-border" />
    </div>
  );
}
