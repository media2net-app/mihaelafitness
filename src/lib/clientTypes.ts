/** Online coaching clients use the Training-Only plan (e.g. Maria, Lazarescu Denisa). */
export function isOnlineClient(client: { plan?: string | null } | null | undefined): boolean {
  return client?.plan === 'Training-Only';
}
