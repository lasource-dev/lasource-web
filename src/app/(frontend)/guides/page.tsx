import type { Metadata } from 'next'

import { ContentIndex } from '../../../components/ContentIndex'
import { getApplicationPayload } from '../../../lib/get-application-payload'
import type { Category } from '../../../../payload-types'

const expandedCategories = (categories: (string | Category)[] | null | undefined) =>
  categories?.filter((category): category is Category => typeof category === 'object') ?? []

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  alternates: { canonical: '/guides' },
  description: 'Des guides pour comprendre un sujet et choisir une technologie ou une approche adaptée.',
  title: 'Guides de développement web',
}

export default async function GuidesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[] }>
}) {
  const requestedTag = (await searchParams).tag
  const tag = (Array.isArray(requestedTag) ? requestedTag[0] : requestedTag)?.trim().slice(0, 80) ?? ''
  const payload = await getApplicationPayload()
  const contents = await payload.find({
    collection: 'editorial-contents',
    depth: 1,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: '-published_at',
    where: { and: [{ content_type: { equals: 'guide' } }, { editorial_status: { equals: 'published' } }, { _status: { equals: 'published' } }] },
  })
  const categoriesBySlug = new Map(
    contents.docs.flatMap((content) => expandedCategories(content.categories)).map((category) => [category.slug, category]),
  )
  const categories = [...categoriesBySlug.values()].sort((first, second) =>
    first.canonical_name.localeCompare(second.canonical_name, 'fr'),
  )
  const selectedCategory = categoriesBySlug.get(tag)
  const filteredContents = selectedCategory
    ? contents.docs.filter((content) =>
        expandedCategories(content.categories).some((category) => category.id === selectedCategory.id),
      )
    : contents.docs

  return (
    <ContentIndex
      description="Comprenez les concepts essentiels et choisissez une approche adaptée à votre projet."
      filterGroups={[
        {
          ariaLabel: 'Filtrer les guides par thème',
          label: 'Thème',
          filters: [
            { active: !selectedCategory, href: '/guides', label: 'Tous' },
            ...categories.map((category) => ({
              active: category.id === selectedCategory?.id,
              href: `/guides?tag=${encodeURIComponent(category.slug)}`,
              label: category.canonical_name,
            })),
          ],
        },
      ]}
      items={filteredContents.map((content) => ({ description: content.description, href: `/guides/${content.slug}`, title: content.title }))}
      title="Guides"
    />
  )
}
