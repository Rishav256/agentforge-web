export default async function WorkflowsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <p className="font-mono text-sm text-text-secondary">
        Workflows for org {orgId} — builder UI not yet built.
      </p>
    </div>
  );
}
