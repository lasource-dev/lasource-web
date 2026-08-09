import config from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { ContentSources } from './ContentSources'
import { Breadcrumbs } from './Breadcrumbs'
import { MarkdownContent } from './MarkdownContent'
import { StructuredData } from './StructuredData'
import { EditorialStatus } from './EditorialStatus'
import type { EditorialContentType } from '../lib/editorial-content-public'
import { loadPublishedEditorialContent } from '../lib/editorial-content-public'
import { readServerEnvironment } from '../lib/env'
import { buildArticleData, buildBreadcrumbData } from '../lib/structured-data'

import styles from '../app/(frontend)/technologies/[slug]/technology.module.css'

type EditorialContentPageProps = {
  slug: string
  type: EditorialContentType
}

const LEVEL_LABELS = {
  advanced: 'Avancé',
  all: 'Tous niveaux',
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
} as const

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value))

export async function EditorialContentPage({ slug, type }: EditorialContentPageProps) {
  const content = await loadPublishedEditorialContent(slug, type, async (queriedSlug, queriedType) => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'editorial-contents',
      depth: 1,
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

  const segment = type === 'guide' ? 'guides' : 'tutoriels'
  const typeLabel = type === 'guide' ? 'Guides' : 'Tutoriels'
  const serverURL = readServerEnvironment().NEXT_PUBLIC_SERVER_URL
  const canonical = new URL(`/${segment}/${content.slug}`, serverURL).toString()

  return (
    <main className={styles.page} id="contenu">
      <StructuredData
        data={[
          buildArticleData({
            canonical,
            dateModified: content.updatedAt,
            datePublished: content.published_at,
            description: content.description,
            headline: content.title,
          }),
          buildBreadcrumbData(serverURL, [
            { href: '/', label: 'Accueil' },
            { href: `/${segment}`, label: typeLabel },
            { href: `/${segment}/${content.slug}`, label: content.title },
          ]),
        ]}
      />
      <Breadcrumbs
        items={[
          { href: '/', label: 'Accueil' },
          { href: `/${segment}`, label: typeLabel },
          { label: content.title },
        ]}
      />
      <p className={styles.eyebrow}>{type === 'guide' ? 'Guide' : 'Tutoriel'}</p>
      <EditorialStatus status={content.review_status} />
      <h1 className={styles.title}>{content.title}</h1>
      <p className={styles.summary}>{content.description}</p>
      <dl className={styles.details}>
        <div className={styles.detail}>
          <dt>Niveau</dt>
          <dd>{LEVEL_LABELS[content.level]}</dd>
        </div>
        {content.published_at ? (
          <div className={styles.detail}>
            <dt>Publié le</dt>
            <dd>{formatDate(content.published_at)}</dd>
          </div>
        ) : null}
        <div className={styles.detail}>
          <dt>Prochaine vérification</dt>
          <dd>{formatDate(content.next_review_at)}</dd>
        </div>
      </dl>
      <article className={styles.content}>
        <MarkdownContent skipLeadingTitle source={content.body_markdown} />
      </article>
      <ContentSources className={styles.sources} sources={content.source_ids} />
    </main>
  )
}
