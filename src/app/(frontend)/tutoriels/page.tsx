import type { Metadata } from 'next'

import { ContentIndex } from '../../../components/ContentIndex'
import { getApplicationPayload } from '../../../lib/get-application-payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  alternates: { canonical: '/tutoriels' },
  description: 'Des tutoriels pas à pas pour réaliser des tâches concrètes en développement web.',
  title: 'Tutoriels de développement web',
}

export default async function TutorialsIndexPage() {
  const payload = await getApplicationPayload()
  const contents = await payload.find({
    collection: 'editorial-contents',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: '-published_at',
    where: { and: [{ content_type: { equals: 'tutorial' } }, { editorial_status: { equals: 'published' } }, { _status: { equals: 'published' } }] },
  })

  return (
    <ContentIndex
      description="Progressez étape par étape avec des exemples concrets, accessibles et vérifiables."
      items={contents.docs.map((content) => ({ description: content.description, href: `/tutoriels/${content.slug}`, title: content.title }))}
      title="Tutoriels"
    />
  )
}
