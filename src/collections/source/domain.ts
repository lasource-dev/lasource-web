import type { Source } from '../../../payload-types'

export const SOURCE_TYPES = [
  'documentation',
  'github',
  'rfc',
  'official_blog',
  'video',
  'scientific_publication',
] as const

export const SOURCE_EDITORIAL_STATUSES = ['draft', 'published'] as const

export const SOURCE_INDEX_POLICY = {
  editorial_status: { index: true },
  type: { index: true },
  url: { index: true, unique: true },
  verified_at: { index: true },
} as const

const TRACKING_PARAMETERS = new Set(['gclid', 'fbclid'])

export function normalizeSourceURL(value: string): string {
  const url = new URL(value.trim())
  url.hash = ''
  url.protocol = url.protocol.toLowerCase()
  url.hostname = url.hostname.toLowerCase()

  for (const parameter of [...url.searchParams.keys()]) {
    if (parameter.toLowerCase().startsWith('utm_') || TRACKING_PARAMETERS.has(parameter.toLowerCase())) {
      url.searchParams.delete(parameter)
    }
  }

  url.searchParams.sort()
  if (url.pathname !== '/') {
    url.pathname = url.pathname.replace(/\/+$/, '')
  }

  return url.toString()
}

export function validateSourceURL(value: string | null | undefined): true | string {
  if (!value) return "L'URL est obligatoire."

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? true
      : 'Utilisez une URL HTTP ou HTTPS.'
  } catch {
    return 'Utilisez une URL absolue valide.'
  }
}

export function validateConfidenceScore(value: number | null | undefined): true | string {
  if (!Number.isInteger(value) || value === undefined || value === null) {
    return 'Le score de confiance doit être un entier.'
  }
  return value >= 0 && value <= 100 ? true : 'Le score de confiance doit être compris entre 0 et 100.'
}

export function assertImmutableSourceID(
  incomingID: unknown,
  originalID: string | number | null | undefined,
): void {
  if (incomingID !== undefined && originalID != null && incomingID !== originalID) {
    throw new Error('Source id is immutable')
  }
}

export function prepareSourceData(
  data: Partial<Source>,
  operation: 'create' | 'update',
  originalDoc?: Source,
): Partial<Source> {
  if (operation === 'update') {
    assertImmutableSourceID(data.id, originalDoc?.id)
  }

  if (data.url !== undefined) {
    data.url = normalizeSourceURL(data.url)
  }

  const editorialStatus = data.editorial_status ?? originalDoc?.editorial_status ?? 'draft'
  const archived = data.archived ?? originalDoc?.archived ?? false
  const verifiedAt = data.verified_at ?? originalDoc?.verified_at

  if (editorialStatus === 'published' && !archived && !verifiedAt) {
    throw new Error('verified_at is required to publish an active Source')
  }

  data._status = editorialStatus === 'published' && !archived ? 'published' : 'draft'
  return data
}

export function isPublishedSource(
  source: Pick<Source, '_status' | 'archived' | 'editorial_status'>,
): boolean {
  return source.editorial_status === 'published' && source._status === 'published' && !source.archived
}

export function assertValidPublishedTechnologySources(
  technologyEditorialStatus: string,
  sources: Source[],
): void {
  if (technologyEditorialStatus === 'published' && sources.some((source) => !isPublishedSource(source))) {
    throw new Error('A published Technology can only reference published, active Sources')
  }
}

export function assertSourceCanBecomeNonPublic(publishedTechnologyCount: number): void {
  if (publishedTechnologyCount > 0) {
    throw new Error('A Source used by a published Technology cannot be archived or unpublished')
  }
}
