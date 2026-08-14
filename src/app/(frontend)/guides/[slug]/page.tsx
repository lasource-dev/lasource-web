import type { Metadata } from 'next'

import { EditorialContentPage } from '../../../../components/EditorialContentPage'
import { readServerEnvironment } from '../../../../lib/env'
import { getApplicationPayload } from '../../../../lib/get-application-payload'
import {
  buildEditorialContentMetadata,
  loadPublishedEditorialContent,
} from '../../../../lib/editorial-content-public'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const content = await loadPublishedEditorialContent(slug, 'guide', async () => {
    const payload = await getApplicationPayload()
    const result = await payload.find({
      collection: 'editorial-contents',
      limit: 1,
      overrideAccess: false,
      pagination: false,
      where: { and: [{ slug: { equals: slug } }, { content_type: { equals: 'guide' } }] },
    })
    return result.docs
  })
  return content
    ? buildEditorialContentMetadata(content, readServerEnvironment().NEXT_PUBLIC_SERVER_URL)
    : {}
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params
  return <EditorialContentPage slug={slug} type="guide" />
}
