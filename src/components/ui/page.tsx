import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-bg p-10">
      <Panel className="w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-xs text-text-secondary">
            RUN #1042
          </span>
          <StatusBadge status="running" />
        </div>

        <h1 className="mb-2 text-lg font-semibold text-text-primary">
          Component test panel
        </h1>

        <div className="flex flex-col gap-2">
          <StatusBadge status="succeeded" />
          <StatusBadge status="failed" />
          <StatusBadge status="pending" />
          <StatusBadge status="skipped" />
        </div>
      </Panel>
    </div>
  );
}
