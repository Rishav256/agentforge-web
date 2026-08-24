import { cn } from '@/lib/utils';
import type { ReactNode, HTMLAttributes } from 'react';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
}

export function Panel({
  children,
  elevated = false,
  className,
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-border',
        elevated ? 'bg-surface-elevated' : 'bg-surface',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
