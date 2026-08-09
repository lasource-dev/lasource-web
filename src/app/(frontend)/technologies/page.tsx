import config from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

import { ContentIndex } from '../../../components/ContentIndex'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  alternates: { canonical: '/technologies' },
  description: 'Découvrez les langages, frameworks, outils et plateformes du développement web.',
  title: 'Technologies du développement web',
}

export default async function TechnologiesIndexPage() {
  const payload = await getPayload({ config })
  const technologies = await payload.find({
    collection: 'technologies',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: 'canonical_name',
    where: { and: [{ editorial_status: { equals: 'published' } }, { _status: { equals: 'published' } }] },
  })

  return (
    <ContentIndex
      description="Comprenez le rôle, les usages, les limites et l’écosystème des principales technologies du Web."
      items={technologies.docs.map((technology) => ({
        description: technology.short_description,
        href: `/technologies/${technology.slug}`,
        title: technology.canonical_name,
      }))}
      title="Technologies"
    />
  )
}
