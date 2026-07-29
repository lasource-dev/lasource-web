import type { Technology } from '../../../payload-types'

export const EDITORIAL_STATUSES = ['draft', 'published', 'archived'] as const
export const FRESHNESS_STATUSES = ['fresh', 'review_due', 'stale', 'unknown'] as const

export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number]
export type FreshnessStatus = (typeof FRESHNESS_STATUSES)[number]

export type AliasRow = {
  alias: string
  id?: string | null
}

export const TECHNOLOGY_INDEX_POLICY = {
  canonical_name: { index: true },
  editorial_status: { index: true },
  freshness_status: { index: true },
  slug: { index: true, unique: true },
} as const

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, ' ')

export function normalizeAliases(value: unknown, canonicalName?: string): AliasRow[] {
  if (!Array.isArray(value)) {
    return []
  }

  const canonicalKey = canonicalName ? normalizeWhitespace(canonicalName).toLocaleLowerCase('fr') : null
  const seen = new Set<string>()
  const normalized: AliasRow[] = []

  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || !('alias' in entry)) {
      continue
    }

    const aliasValue = entry.alias
    if (typeof aliasValue !== 'string') {
      continue
    }

    const alias = normalizeWhitespace(aliasValue)
    const key = alias.toLocaleLowerCase('fr')
    if (!alias || key === canonicalKey || seen.has(key)) {
      continue
    }

    seen.add(key)
    normalized.push({
      alias,
      ...('id' in entry && typeof entry.id === 'string' ? { id: entry.id } : {}),
    })
  }

  return normalized
}

export function assertImmutableTechnologyID(
  incomingID: unknown,
  originalID: string | number | null | undefined,
): void {
  if (incomingID !== undefined && originalID != null && incomingID !== originalID) {
    throw new Error('Technology id is immutable')
  }
}

export function normalizeTechnologySlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function assertImmutableTechnologySlug(
  incomingSlug: string | undefined,
  originalSlug: string | null | undefined,
): void {
  if (incomingSlug !== undefined && originalSlug && incomingSlug !== originalSlug) {
    throw new Error('Technology slug is immutable')
  }
}

export function payloadStatusFor(editorialStatus: EditorialStatus | null | undefined) {
  return editorialStatus === 'published' ? ('published' as const) : ('draft' as const)
}

export function isPublishedTechnology(status: EditorialStatus, payloadStatus?: string | null) {
  return status === 'published' && payloadStatus === 'published'
}

export function prepareTechnologyData(
  data: Partial<Technology>,
  operation: 'create' | 'update',
  originalDoc?: Technology,
): Partial<Technology> {
  if (operation === 'update') {
    assertImmutableTechnologyID(data.id, originalDoc?.id)
  }

  if (operation === 'create') {
    data.slug = normalizeTechnologySlug(data.slug ?? data.canonical_name ?? '')
  } else if (data.slug !== undefined) {
    data.slug = normalizeTechnologySlug(data.slug)
    assertImmutableTechnologySlug(data.slug, originalDoc?.slug)
  }

  const canonicalName = data.canonical_name ?? originalDoc?.canonical_name

  if (data.aliases !== undefined) {
    data.aliases = normalizeAliases(data.aliases, canonicalName)
  }

  const editorialStatus = data.editorial_status ?? originalDoc?.editorial_status ?? 'draft'
  const freshnessStatus = data.freshness_status ?? originalDoc?.freshness_status ?? 'unknown'
  const verifiedAt = data.verified_at ?? originalDoc?.verified_at

  if (freshnessStatus !== 'unknown' && !verifiedAt) {
    throw new Error('verified_at is required when freshness_status is known')
  }

  data._status = payloadStatusFor(editorialStatus)

  return data
}

export function validateSlug(value: string | null | undefined): true | string {
  if (!value) return 'Le slug est obligatoire.'
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
    ? true
    : 'Utilisez uniquement des minuscules, chiffres et tirets simples.'
}

export function validateHTTPURL(value: string | null | undefined): true | string {
  if (!value) return true

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? true
      : 'Utilisez une URL HTTP ou HTTPS.'
  } catch {
    return 'Utilisez une URL absolue valide.'
  }
}
