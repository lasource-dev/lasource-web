export function normalizeSearchQuery(value: string | string[] | undefined): string {
  const query = Array.isArray(value) ? value[0] : value
  return query?.trim().replace(/\s+/g, ' ').slice(0, 80) ?? ''
}

export function buildContainsSearch(fields: readonly string[], query: string) {
  return fields.map((field) => ({ [field]: { contains: query } }))
}
