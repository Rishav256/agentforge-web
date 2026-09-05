import { notFound } from 'next/navigation';
import { createNhostClient } from '@/lib/nhost/server';
import { getOrgIfMember } from '@/lib/graphql/orgs';

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const nhost = await createNhostClient();
  const org = await getOrgIfMember(nhost, orgId);

  if (!org) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-bg">
      <header className="border-b border-border px-6 py-3">
        <span className="font-mono text-xs text-text-secondary">
          {org.name} · {org.role.toUpperCase()}
        </span>
      </header>
      <main className="flex flex-1">{children}</main>
    </div>
  );
}
