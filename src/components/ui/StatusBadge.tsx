import { cn } from '@/lib/utils';

type RunStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';
type StepRunStatus =
  | 'pending'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'paused'
  | 'skipped';

export type Status = RunStatus | StepRunStatus;

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: string; className: string }
> = {
  pending: { label: 'STANDBY', icon: '○', className: 'text-text-muted' },
  running: { label: 'RUNNING', icon: '●', className: 'text-amber' },
  paused: { label: 'WAITING', icon: '●', className: 'text-amber' },
  completed: { label: 'SUCCESS', icon: '✓', className: 'text-green' },
  succeeded: { label: 'SUCCESS', icon: '✓', className: 'text-green' },
  failed: { label: 'FAILED', icon: '✕', className: 'text-red' },
  skipped: { label: 'SKIPPED', icon: '○', className: 'text-text-muted' },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-xs font-medium',
        config.className,
        className,
      )}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}
