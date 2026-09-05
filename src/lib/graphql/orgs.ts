import type { NhostClient } from '@nhost/nhost-js';

export interface UserOrg {
  id: string;
  name: string;
  role: string;
}

const GET_USER_ORGS = `
  query GetUserOrgs {
    org_members {
      role
      organization {
        id
        name
      }
    }
  }
`;

interface GetUserOrgsResponse {
  org_members: Array<{
    role: string;
    organization: { id: string; name: string };
  }>;
}

export async function getUserOrgs(nhost: NhostClient): Promise<UserOrg[]> {
  const response = await nhost.graphql.request<GetUserOrgsResponse>({
    query: GET_USER_ORGS,
  });

  const members = response.body.data?.org_members ?? [];

  return members.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    role: m.role,
  }));
}

export async function getOrgIfMember(
  nhost: NhostClient,
  orgId: string,
): Promise<UserOrg | null> {
  const orgs = await getUserOrgs(nhost);
  return orgs.find((o) => o.id === orgId) ?? null;
}
