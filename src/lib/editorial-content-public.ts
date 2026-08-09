import type { Metadata } from 'next'

import type { EditorialContent } from '../../payload-types'

export type EditorialContentType = 'guide' | 'tutorial'
export type EditorialContentQuery = (
  slug: string,
  type: EditorialContentType,
) => Promise<readonly EditorialContent[]>

export async function loadPublishedEditorialContent(
  slug: string,
  type: EditorialContentType,
  query: EditorialContentQuery,
): Promise<EditorialContent | null> {
  const [content] = await query(slug, type)
  return content?.slug === slug &&
    content.content_type === type &&
    content.editorial_status === 'published' &&
    content._status === 'published'
    ? content
    : null
}

export function buildEditorialContentMetadata(
  content: EditorialContent,
  serverURL: string,
): Metadata {
  const segment = content.content_type === 'guide' ? 'guides' : 'tutoriels'
  const canonical = new URL(`/${segment}/${content.slug}`, serverURL).toString()
  const title = content.meta_title?.trim() || content.title
  const description = content.meta_description?.trim() || content.description
  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      modifiedTime: content.updatedAt,
      ...(content.published_at ? { publishedTime: content.published_at } : {}),
      title,
      type: 'article',
      url: canonical,
    },
    title,
    twitter: { card: 'summary', description, title },
  }
}
