export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-bg p-10">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-xs text-text-secondary">
            RUN #1042
          </span>
          <span className="font-mono text-xs text-amber">● RUNNING</span>
        </div>

        <h1 className="mb-2 text-lg font-semibold text-text-primary">
          Token test panel
        </h1>
        <p className="mb-4 text-sm text-text-secondary">
          If this renders with a dark teal background, teal/amber/green/red
          accents below, and monospace run ID — the pipeline works.
        </p>

        <div className="flex gap-3 font-mono text-xs">
          <span className="text-teal">TEAL</span>
          <span className="text-green">✓ SUCCESS</span>
          <span className="text-red">✕ FAILED</span>
          <span className="text-violet">LLM_CALL</span>
        </div>
      </div>
    </div>
  );
}
