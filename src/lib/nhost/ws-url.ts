export function getGraphqlWsUrl(region: string, subdomain: string): string {
  if (subdomain === 'local') {
    return 'wss://local.hasura.local.nhost.run/v1/graphql';
  }
  return `wss://${subdomain}.hasura.${region}.nhost.run/v1/graphql`;
}
