import type { Metadata } from 'next'

import type { Category, Technology } from '../../payload-types'
import { isPublishedCategory } from '../collections/category/domain'
import { isPublishedTechnology } from '../collections/technology/domain'

export type TechnologyQuery = (slug: string) => Promise<readonly Technology[]>

export function getPublicTechnologyCategory(technology: Technology): Category | null {
  const category = technology.category
  return typeof category === 'object' && category !== null && isPublishedCategory(category)
    ? category
    : null
}

export async function loadPublishedTechnology(
  slug: string,
  query: TechnologyQuery,
): Promise<Technology | null> {
  const [technology] = await query(slug)

  if (
    !technology ||
    technology.slug !== slug ||
    !isPublishedTechnology(technology.editorial_status, technology._status) ||
    !getPublicTechnologyCategory(technology)
  ) {
    return null
  }

  return technology
}

export function buildTechnologyMetadata(technology: Technology, serverURL: string): Metadata {
  const title = technology.meta_title?.trim() || technology.canonical_name
  const description = technology.meta_description?.trim() || technology.short_description
  const canonical = new URL(`/technologies/${technology.slug}`, serverURL).toString()

  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      title,
      type: 'article',
      url: canonical,
    },
    title,
  }
}
