import type { Metadata } from 'next'

import { ContentIndex } from '../../../components/ContentIndex'
import { getApplicationPayload } from '../../../lib/get-application-payload'
import type { Category, Technology } from '../../../../payload-types'

const additionalTechnologyTypes: Record<string, readonly string[]> = {
  css: ['frontend'],
  html: ['frontend'],
}

const relationshipID = (value: Category['parent_category']) =>
  typeof value === 'object' && value !== null ? value.id : value

const technologyTypeSlugs = (
  technology: Technology,
  categoryBySlug: ReadonlyMap<string, Category>,
) => {
  const primaryType = typeof technology.category === 'object' ? technology.category?.slug : undefined
  const primaryCategory = primaryType ? categoryBySlug.get(primaryType) : undefined
  const parentID = relationshipID(primaryCategory?.parent_category)
  const parentType = parentID
    ? [...categoryBySlug.values()].find((category) => category.id === parentID)?.slug
    : undefined
  return [primaryType, parentType, ...(additionalTechnologyTypes[technology.slug] ?? [])].filter(
    (slug): slug is string => Boolean(slug),
  )
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
  searchParams: Promise<{ q?: string | string[]; theme?: string | string[]; type?: string | string[] }>
}) {
  const params = await searchParams
  const requestedQuery = params.q
  const requestedType = params.type
  const requestedTheme = params.theme
  const search = (Array.isArray(requestedQuery) ? requestedQuery[0] : requestedQuery)?.trim().slice(0, 80) ?? ''
  const type = (Array.isArray(requestedType) ? requestedType[0] : requestedType)?.trim().slice(0, 80) ?? ''
  const theme = (Array.isArray(requestedTheme) ? requestedTheme[0] : requestedTheme)?.trim().slice(0, 80) ?? ''
  const payload = await getApplicationPayload()
  const categories = await payload.find({
    collection: 'categories',
    depth: 1,
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
  const categoryBySlug = new Map(categories.docs.map((category) => [category.slug, category]))
  const representedTypeSlugs = new Set(
    allTechnologies.docs.flatMap((technology) => technologyTypeSlugs(technology, categoryBySlug)),
  )
  const representedCategories = categories.docs.filter((category) =>
    representedTypeSlugs.has(category.slug),
  )
  const topLevelCategories = representedCategories.filter((category) => !category.parent_category)
  const selectedCategory = topLevelCategories.find((category) => category.slug === type)
  const subcategories = selectedCategory
    ? representedCategories.filter(
        (category) => relationshipID(category.parent_category) === selectedCategory.id,
      )
    : []
  const selectedSubcategory = subcategories.find((category) => category.slug === theme)
  const normalizedSearch = search.toLocaleLowerCase('fr')
  const technologies = allTechnologies.docs.filter(
    (technology) =>
      (!normalizedSearch || technology.canonical_name.toLocaleLowerCase('fr').includes(normalizedSearch)) &&
      (!selectedCategory ||
        technologyTypeSlugs(technology, categoryBySlug).includes(selectedCategory.slug)) &&
      (!selectedSubcategory ||
        technologyTypeSlugs(technology, categoryBySlug).includes(selectedSubcategory.slug)),
  )

  return (
    <ContentIndex
      description="Comprenez le rôle, les usages, les limites et l’écosystème des principales technologies du Web."
      filterGroups={[
        {
          ariaLabel: 'Filtrer les technologies par type',
          label: 'Type',
          filters: [
            { active: !selectedCategory, href: '/technologies', label: 'Tous' },
            ...topLevelCategories.map((category) => ({
              active: category.id === selectedCategory?.id,
              href: `/technologies?type=${encodeURIComponent(category.slug)}`,
              label: category.canonical_name,
            })),
          ],
        },
        ...(selectedCategory && subcategories.length > 0
          ? [
              {
                ariaLabel: `Filtrer ${selectedCategory.canonical_name} par sous-thème`,
                label: 'Sous-thème',
                filters: [
                  {
                    active: !selectedSubcategory,
                    href: `/technologies?type=${encodeURIComponent(selectedCategory.slug)}`,
                    label: 'Tous',
                  },
                  ...subcategories.map((category) => ({
                    active: category.id === selectedSubcategory?.id,
                    href: `/technologies?type=${encodeURIComponent(selectedCategory.slug)}&theme=${encodeURIComponent(category.slug)}`,
                    label: category.canonical_name,
                  })),
                ],
              },
            ]
          : []),
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
