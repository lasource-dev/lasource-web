import type { Metadata } from 'next'

import { ContentIndex } from '../../../components/ContentIndex'
import { getApplicationPayload } from '../../../lib/get-application-payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  alternates: { canonical: '/technologies' },
  description: 'Découvrez les langages, frameworks, outils et plateformes du développement web.',
  title: 'Technologies du développement web',
}

export default async function TechnologiesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const requestedQuery = (await searchParams).q
  const search = (Array.isArray(requestedQuery) ? requestedQuery[0] : requestedQuery)?.trim().slice(0, 80) ?? ''
  const payload = await getApplicationPayload()
  const technologies = await payload.find({
    collection: 'technologies',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: 'canonical_name',
    where: {
      and: [
        { editorial_status: { equals: 'published' } },
        { _status: { equals: 'published' } },
        ...(search ? [{ canonical_name: { contains: search } }] : []),
      ],
    },
  })

  return (
    <ContentIndex
      description="Comprenez le rôle, les usages, les limites et l’écosystème des principales technologies du Web."
      items={technologies.docs.map((technology) => ({
        description: technology.short_description,
        href: `/technologies/${technology.slug}`,
        title: technology.canonical_name,
      }))}
      search={search}
      title="Technologies"
    />
  )
}
