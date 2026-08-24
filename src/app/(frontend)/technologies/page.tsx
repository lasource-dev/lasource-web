import type { Metadata } from 'next'

import { ContentIndex } from '../../../components/ContentIndex'
import { getApplicationPayload } from '../../../lib/get-application-payload'

const additionalTechnologyTypes: Record<string, readonly string[]> = {
  css: ['frontend'],
}

const technologyTypeSlugs = (technology: { category?: null | number | string | { slug?: null | string }; slug: string }) => {
  const primaryType = typeof technology.category === 'object' ? technology.category?.slug : undefined
  return [primaryType, ...(additionalTechnologyTypes[technology.slug] ?? [])].filter(Boolean)
}

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  alternates: { canonical: '/technologies' },
  description: 'Découvrez les langages, frameworks, outils et plateformes du développement web.',
  title: 'Technologies du développement web',
}

export default async function TechnologiesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; type?: string | string[] }>
}) {
  const params = await searchParams
  const requestedQuery = params.q
  const requestedType = params.type
  const search = (Array.isArray(requestedQuery) ? requestedQuery[0] : requestedQuery)?.trim().slice(0, 80) ?? ''
  const type = (Array.isArray(requestedType) ? requestedType[0] : requestedType)?.trim().slice(0, 80) ?? ''
  const payload = await getApplicationPayload()
  const categories = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: 'canonical_name',
    where: {
      and: [
        { editorial_status: { equals: 'published' } },
        { _status: { equals: 'published' } },
        { archived: { not_equals: true } },
      ],
    },
  })
  const allTechnologies = await payload.find({
    collection: 'technologies',
    depth: 1,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: 'canonical_name',
    where: {
      and: [
        { editorial_status: { equals: 'published' } },
        { _status: { equals: 'published' } },
      ],
    },
  })
  const representedTypeSlugs = new Set(allTechnologies.docs.flatMap(technologyTypeSlugs))
  const representedCategories = categories.docs.filter((category) => representedTypeSlugs.has(category.slug))
  const selectedCategory = representedCategories.find((category) => category.slug === type)
  const normalizedSearch = search.toLocaleLowerCase('fr')
  const technologies = allTechnologies.docs.filter(
    (technology) =>
      (!normalizedSearch || technology.canonical_name.toLocaleLowerCase('fr').includes(normalizedSearch)) &&
      (!selectedCategory || technologyTypeSlugs(technology).includes(selectedCategory.slug)),
  )

  return (
    <ContentIndex
      description="Comprenez le rôle, les usages, les limites et l’écosystème des principales technologies du Web."
      filters={[
        { active: !selectedCategory, href: '/technologies', label: 'Tous' },
        ...representedCategories.map((category) => ({
          active: category.id === selectedCategory?.id,
          href: `/technologies?type=${encodeURIComponent(category.slug)}`,
          label: category.canonical_name,
        })),
      ]}
      items={technologies.map((technology) => ({
        description: technology.short_description,
        href: `/technologies/${technology.slug}`,
        title: technology.canonical_name,
      }))}
      search={search}
      title="Technologies"
    />
  )
}
