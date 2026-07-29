import type { Metadata } from 'next'

import type { Category } from '../../payload-types'

export function buildCategoryMetadata(category: Category): Metadata {
  const title = category.meta_title?.trim() || category.canonical_name
  const description = category.meta_description?.trim() || category.short_description

  return { description, title }
}
