import config from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { MarkdownContent } from './MarkdownContent'
import { EditorialStatus } from './EditorialStatus'
import type { EditorialContentType } from '../lib/editorial-content-public'
import { loadPublishedEditorialContent } from '../lib/editorial-content-public'

import styles from '../app/(frontend)/technologies/[slug]/technology.module.css'

type EditorialContentPageProps = {
  slug: string
  type: EditorialContentType
}

export async function EditorialContentPage({ slug, type }: EditorialContentPageProps) {
  const content = await loadPublishedEditorialContent(slug, type, async (queriedSlug, queriedType) => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'editorial-contents',
      limit: 1,
      overrideAccess: false,
      pagination: false,
      where: {
        and: [
          { slug: { equals: queriedSlug } },
          { content_type: { equals: queriedType } },
          { editorial_status: { equals: 'published' } },
          { _status: { equals: 'published' } },
        ],
      },
    })
    return result.docs
  })

  if (!content) notFound()

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>{type === 'guide' ? 'Guide' : 'Tutoriel'}</p>
      <EditorialStatus status={content.review_status} />
      <h1 className={styles.title}>{content.title}</h1>
      <p className={styles.summary}>{content.description}</p>
      <article className={styles.content}>
        <MarkdownContent source={content.body_markdown} />
      </article>
    </main>
  )
}
