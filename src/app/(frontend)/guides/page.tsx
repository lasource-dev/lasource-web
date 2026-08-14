import type { Metadata } from 'next'

import { ContentIndex } from '../../../components/ContentIndex'
import { getApplicationPayload } from '../../../lib/get-application-payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  alternates: { canonical: '/guides' },
  description: 'Des guides pour comprendre un sujet et choisir une technologie ou une approche adaptée.',
  title: 'Guides de développement web',
}

export default async function GuidesIndexPage() {
  const payload = await getApplicationPayload()
  const contents = await payload.find({
    collection: 'editorial-contents',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: '-published_at',
    where: { and: [{ content_type: { equals: 'guide' } }, { editorial_status: { equals: 'published' } }, { _status: { equals: 'published' } }] },
  })

  return (
    <ContentIndex
      description="Comprenez les concepts essentiels et choisissez une approche adaptée à votre projet."
      items={contents.docs.map((content) => ({ description: content.description, href: `/guides/${content.slug}`, title: content.title }))}
      title="Guides"
    />
  )
}
