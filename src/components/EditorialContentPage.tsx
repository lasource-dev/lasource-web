import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { Category, EditorialContent, Technology } from '../../payload-types'

import { ContentSources } from './ContentSources'
import { Breadcrumbs } from './Breadcrumbs'
import { MarkdownContent } from './MarkdownContent'
import { StructuredData } from './StructuredData'
import { EditorialStatus } from './EditorialStatus'
import { AffiliateSections } from './AffiliateSections'
import type { EditorialContentType } from '../lib/editorial-content-public'
import { loadPublishedEditorialContent } from '../lib/editorial-content-public'
import { readServerEnvironment } from '../lib/env'
import { buildArticleData, buildBreadcrumbData } from '../lib/structured-data'
import { loadAffiliateSections } from '../lib/affiliate-recommendations'

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

const populatedCategories = (content: EditorialContent): Category[] =>
  content.categories?.filter((category): category is Category => typeof category === 'object') ?? []

const populatedTechnologies = (content: EditorialContent): Technology[] =>
  content.technologies?.filter(
    (technology): technology is Technology => typeof technology === 'object',
  ) ?? []

const relationshipIDs = (values: EditorialContent['technologies']): string[] =>
  values?.map((value) => String(typeof value === 'object' ? value.id : value)) ?? []

const contentHref = (content: EditorialContent) =>
  `/${content.content_type === 'guide' ? 'guides' : 'tutoriels'}/${content.slug}`

export async function EditorialContentPage({ slug, type }: EditorialContentPageProps) {
  const payload = await getPayload({ config })
  const content = await loadPublishedEditorialContent(slug, type, async (queriedSlug, queriedType) => {
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

  const technologyIDs = relationshipIDs(content.technologies)
  const relatedResult = technologyIDs.length
    ? await payload.find({
        collection: 'editorial-contents',
        depth: 1,
        limit: 5,
        overrideAccess: false,
        pagination: false,
        sort: '-published_at',
        where: {
          and: [
            { editorial_status: { equals: 'published' } },
            { _status: { equals: 'published' } },
            { or: technologyIDs.map((id) => ({ technologies: { contains: id } })) },
          ],
        },
      })
    : { docs: [] }
  const relatedContents = relatedResult.docs.filter((item) => item.id !== content.id).slice(0, 4)
  const affiliateSections = await loadAffiliateSections(payload, content)
  const categories = populatedCategories(content)
  const technologies = populatedTechnologies(content)

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
      {categories.length || technologies.length ? (
        <section aria-labelledby="content-taxonomy" className={styles.taxonomy}>
          <h2 className={styles.visuallyHidden} id="content-taxonomy">Classification du contenu</h2>
          {categories.length ? (
            <div className={styles.tagGroup}>
              <h3>Types</h3>
              <ul className={styles.tags}>
                {categories.map((category) => (
                  <li className={styles.tag} key={category.id}>{category.canonical_name}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {technologies.length ? (
            <div className={styles.tagGroup}>
              <h3>Technologies</h3>
              <ul className={styles.tags}>
                {technologies.map((technology) => (
                  <li className={styles.tag} key={technology.id}>
                    <Link href={`/technologies/${technology.slug}`}>{technology.canonical_name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
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
      <AffiliateSections contentSlug={content.slug} sections={affiliateSections} />
      {relatedContents.length ? (
        <section aria-labelledby="related-content" className={styles.related}>
          <h2 id="related-content">À lire aussi sur les mêmes technologies</h2>
          <ul>
            {relatedContents.map((related) => (
              <li key={related.id}>
                <h3><Link href={contentHref(related)}>{related.title}</Link></h3>
                <p>{related.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ContentSources className={styles.sources} sources={content.source_ids} />
    </main>
  )
}
