import type { Category } from '../../../payload-types'
import {
  normalizeAliases,
  payloadStatusFor,
  validateSlug,
  type AliasRow,
  type EditorialStatus,
} from '../technology/domain'

export type { AliasRow }

export const CATEGORY_INDEX_POLICY = {
  canonical_name: { index: true },
  editorial_status: { index: true },
  slug: { index: true, unique: true },
} as const

export function normalizeCategorySlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function assertImmutableCategoryID(
  incomingID: unknown,
  originalID: string | number | null | undefined,
): void {
  if (incomingID !== undefined && originalID != null && incomingID !== originalID) {
    throw new Error('Category id is immutable')
  }
}

export function assertImmutableCategorySlug(
  incomingSlug: string | undefined,
  originalSlug: string | null | undefined,
): void {
  if (incomingSlug !== undefined && originalSlug && incomingSlug !== originalSlug) {
    throw new Error('Category slug is immutable')
  }
}

export function isPublishedCategory(
  category: Pick<Category, '_status' | 'archived' | 'editorial_status'>,
): boolean {
  return (
    category.editorial_status === 'published' &&
    category._status === 'published' &&
    category.archived !== true
  )
}

export function assertValidPublishedTechnologyCategory(
  editorialStatus: EditorialStatus,
  category: Category | null,
): void {
  if (editorialStatus === 'published' && (!category || !isPublishedCategory(category))) {
    throw new Error('A published Technology requires a published, active Category')
  }
}

export function assertCategoryCanBecomeNonPublic(
  publishedTechnologyCount: number,
  publishedChildCount = 0,
): void {
  if (publishedTechnologyCount > 0) {
    throw new Error('A Category used by a published Technology cannot be archived or unpublished')
  }
  if (publishedChildCount > 0) {
    throw new Error('A Category with published subcategories cannot be archived or unpublished')
  }
}

export function assertValidCategoryParent({
  categoryID,
  childCount,
  parent,
  publishing,
}: {
  categoryID?: number | string | null
  childCount: number
  parent: Category | null
  publishing: boolean
}): void {
  if (!parent) throw new Error('The parent Category does not exist')
  if (categoryID != null && parent.id === categoryID) {
    throw new Error('A Category cannot be its own parent')
  }
  if (parent.parent_category) {
    throw new Error('Category taxonomy supports a maximum of two levels')
  }
  if (childCount > 0) {
    throw new Error('A Category with subcategories cannot become a subcategory')
  }
  if (publishing && !isPublishedCategory(parent)) {
    throw new Error('A published subcategory requires a published, active parent Category')
  }
}

export function prepareCategoryData(
  data: Partial<Category>,
  operation: 'create' | 'update',
  originalDoc?: Category,
): Partial<Category> {
  if (operation === 'create') {
    data.slug = normalizeCategorySlug(data.slug ?? data.canonical_name ?? '')
  } else {
    assertImmutableCategoryID(data.id, originalDoc?.id)
    if (data.slug !== undefined) {
      data.slug = normalizeCategorySlug(data.slug)
      assertImmutableCategorySlug(data.slug, originalDoc?.slug)
    }
  }

  if (data.aliases !== undefined) {
    data.aliases = normalizeAliases(
      data.aliases,
      data.canonical_name ?? originalDoc?.canonical_name,
    )
  }

  const editorialStatus = (data.editorial_status ??
    originalDoc?.editorial_status ??
    'draft') as EditorialStatus
  const archived = data.archived ?? originalDoc?.archived ?? false
  data._status = archived ? 'draft' : payloadStatusFor(editorialStatus)

  return data
}

export { validateSlug }
