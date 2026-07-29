import type { Relation, Source, Technology } from '../../../payload-types'
import { isPublishedSource } from '../source/domain'
import { isPublishedTechnology } from '../technology/domain'

export const RELATION_TYPES = [
  'compatible_with',
  'developed_by',
  'depends_on',
  'uses',
  'supports',
  'alternative_to',
  'integrates_with',
  'replaces',
] as const

export const ENABLED_RELATION_TYPES = RELATION_TYPES.filter((type) => type !== 'developed_by')
export const SYMMETRIC_RELATION_TYPES = [
  'compatible_with',
  'alternative_to',
  'integrates_with',
] as const

export type RelationType = (typeof RELATION_TYPES)[number]

export const RELATION_INDEX_POLICY = {
  canonical_key: { index: true, unique: true },
  editorial_status: { index: true },
} as const

type RelationshipValue = string | { id: string }

export function relationshipID(value: RelationshipValue | null | undefined): string | undefined {
  if (value == null) return undefined
  return typeof value === 'object' ? value.id : value
}

export function isSymmetricRelationType(type: RelationType): boolean {
  return (SYMMETRIC_RELATION_TYPES as readonly string[]).includes(type)
}

export function canonicalRelationKey(
  sourceID: string,
  targetID: string,
  relationType: RelationType,
): string {
  const [source, target] = isSymmetricRelationType(relationType)
    ? [sourceID, targetID].sort()
    : [sourceID, targetID]
  return `${relationType}:${source}:${target}`
}

export function validateRelationType(value: string | null | undefined): true | string {
  if (!value || !RELATION_TYPES.includes(value as RelationType)) {
    return 'Sélectionnez un type de relation valide.'
  }
  return value === 'developed_by'
    ? 'developed_by est réservé jusqu’à la création de la ressource Organization.'
    : true
}

export function assertImmutableRelationIdentity(
  data: Partial<Relation>,
  originalDoc?: Relation,
): void {
  if (!originalDoc) return
  if (data.id !== undefined && data.id !== originalDoc.id) {
    throw new Error('Relation id is immutable')
  }

  const sourceID = relationshipID(data.source)
  const originalSourceID = relationshipID(originalDoc.source)
  const targetID = relationshipID(data.target)
  const originalTargetID = relationshipID(originalDoc.target)

  if (sourceID !== undefined && sourceID !== originalSourceID) {
    throw new Error('Relation source is immutable')
  }
  if (targetID !== undefined && targetID !== originalTargetID) {
    throw new Error('Relation target is immutable')
  }
  if (data.relation_type !== undefined && data.relation_type !== originalDoc.relation_type) {
    throw new Error('Relation type is immutable')
  }
  if (data.canonical_key !== undefined && data.canonical_key !== originalDoc.canonical_key) {
    throw new Error('Relation canonical key is immutable')
  }
}

export function prepareRelationData(
  data: Partial<Relation>,
  operation: 'create' | 'update',
  originalDoc?: Relation,
): Partial<Relation> {
  if (operation === 'update') {
    assertImmutableRelationIdentity(data, originalDoc)
  }

  const sourceID = relationshipID(data.source ?? originalDoc?.source)
  const targetID = relationshipID(data.target ?? originalDoc?.target)
  const relationType = data.relation_type ?? originalDoc?.relation_type

  if (!sourceID || !targetID || !relationType) {
    return data
  }
  if (sourceID === targetID) {
    throw new Error('A Relation cannot link a Technology to itself')
  }
  if (validateRelationType(relationType) !== true) {
    throw new Error(String(validateRelationType(relationType)))
  }

  const canonicalKey = canonicalRelationKey(sourceID, targetID, relationType)
  if (operation === 'update' && originalDoc?.canonical_key && canonicalKey !== originalDoc.canonical_key) {
    throw new Error('Relation canonical key is immutable')
  }
  data.canonical_key = canonicalKey

  const editorialStatus = data.editorial_status ?? originalDoc?.editorial_status ?? 'draft'
  const archived = data.archived ?? originalDoc?.archived ?? false
  const verifiedAt = data.verified_at ?? originalDoc?.verified_at

  if (editorialStatus === 'published' && !archived && !verifiedAt) {
    throw new Error('verified_at is required to publish an active Relation')
  }

  data._status = editorialStatus === 'published' && !archived ? 'published' : 'draft'
  return data
}

export function assertValidPublishedRelation(
  editorialStatus: string,
  archived: boolean,
  source: Technology,
  target: Technology,
  evidence: Source[],
): void {
  if (editorialStatus !== 'published' || archived) return
  if (!isPublishedTechnology(source.editorial_status, source._status)) {
    throw new Error('A published Relation requires a published source Technology')
  }
  if (!isPublishedTechnology(target.editorial_status, target._status)) {
    throw new Error('A published Relation requires a published target Technology')
  }
  if (evidence.length === 0 || evidence.some((item) => !isPublishedSource(item))) {
    throw new Error('A published Relation requires at least one published, active Source')
  }
}

export function assertResourceCanBecomeNonPublic(
  publishedRelationCount: number,
  resourceName: 'Source' | 'Technology',
): void {
  if (publishedRelationCount > 0) {
    throw new Error(`${resourceName} used by a published Relation cannot become non-public`)
  }
}

export function assertResourceCanBeDeleted(
  relationCount: number,
  resourceName: 'Source' | 'Technology',
): void {
  if (relationCount > 0) {
    throw new Error(`${resourceName} used by a Relation cannot be deleted`)
  }
}
