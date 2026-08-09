import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Technology } from '../../../../../payload-types'
import { ContentSources } from '../../../../components/ContentSources'
import { Breadcrumbs } from '../../../../components/Breadcrumbs'
import { EditorialStatus } from '../../../../components/EditorialStatus'
import { MarkdownContent } from '../../../../components/MarkdownContent'
import { StructuredData } from '../../../../components/StructuredData'
import { readServerEnvironment } from '../../../../lib/env'
import { buildArticleData, buildBreadcrumbData } from '../../../../lib/structured-data'
import {
  buildTechnologyMetadata,
  getPublicTechnologyCategory,
  loadPublishedTechnology,
  type TechnologyQuery,
} from '../../../../lib/technology-public'

import styles from './technology.module.css'

export const dynamic = 'force-dynamic'

type TechnologyPageProps = {
  params: Promise<{ slug: string }>
}

const queryPublishedTechnologies: TechnologyQuery = async (slug) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'technologies',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [
        { slug: { equals: slug } },
        { editorial_status: { equals: 'published' } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  return result.docs
}

const getTechnology = cache((slug: string) =>
  loadPublishedTechnology(slug, queryPublishedTechnologies),
)

export async function generateMetadata({ params }: TechnologyPageProps): Promise<Metadata> {
  const { slug } = await params
  const technology = await getTechnology(slug)

  if (!technology) return {}

  return buildTechnologyMetadata(technology, readServerEnvironment().NEXT_PUBLIC_SERVER_URL)
}

const formatVerificationDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(
        new Date(value),
      )
    : 'Pas encore vérifiée'

const FRESHNESS_LABELS: Record<Technology['freshness_status'], string> = {
  fresh: 'Vérifiées récemment',
  review_due: 'À revérifier',
  stale: 'Probablement obsolètes',
  unknown: 'Non vérifié',
}

type Detail = {
  label: string
  value: string
}

const getDetails = (technology: Technology): Detail[] =>
  [
    technology.license ? { label: 'Licence', value: technology.license } : null,
    technology.primary_language
      ? { label: 'Langage principal', value: technology.primary_language }
      : null,
    technology.latest_version
      ? { label: 'Dernière version', value: technology.latest_version }
      : null,
    { label: 'État des informations', value: FRESHNESS_LABELS[technology.freshness_status] },
    { label: 'Dernière vérification', value: formatVerificationDate(technology.verified_at) },
  ].filter((detail): detail is Detail => detail !== null)

export default async function TechnologyPage({ params }: TechnologyPageProps) {
  const { slug } = await params
  const technology = await getTechnology(slug)

  if (!technology) notFound()

  const category = getPublicTechnologyCategory(technology)
  if (!category) notFound()

  const aliases = technology.aliases?.map(({ alias }) => alias).filter(Boolean) ?? []
  const links = [
    technology.official_website_url
      ? { href: technology.official_website_url, label: 'Site officiel' }
      : null,
    technology.official_documentation_url
      ? { href: technology.official_documentation_url, label: 'Documentation officielle' }
      : null,
    technology.github_url ? { href: technology.github_url, label: 'GitHub' } : null,
  ].filter((link): link is { href: string; label: string } => link !== null)
  const serverURL = readServerEnvironment().NEXT_PUBLIC_SERVER_URL
  const canonical = new URL(`/technologies/${technology.slug}`, serverURL).toString()

  return (
    <main className={styles.page} id="contenu">
      <StructuredData
        data={[
          buildArticleData({
            canonical,
            dateModified: technology.updatedAt,
            description: technology.short_description,
            headline: technology.canonical_name,
          }),
          buildBreadcrumbData(serverURL, [
            { href: '/', label: 'Accueil' },
            { href: '/technologies', label: 'Technologies' },
            { href: `/technologies/${technology.slug}`, label: technology.canonical_name },
          ]),
        ]}
      />
      <Breadcrumbs
        items={[
          { href: '/', label: 'Accueil' },
          { href: '/technologies', label: 'Technologies' },
          { label: technology.canonical_name },
        ]}
      />
      <p className={styles.eyebrow}>Technologie</p>
      <EditorialStatus status={technology.review_status ?? 'unreviewed'} />
      <h1 className={styles.title}>{technology.canonical_name}</h1>
      <p className={styles.summary}>{technology.short_description}</p>
      <p className={styles.aliases}>Catégorie : {category.canonical_name}</p>

      {aliases.length > 0 ? (
        <p className={styles.aliases}>Autres noms : {aliases.join(', ')}</p>
      ) : null}

      {technology.long_description ? (
        <section aria-label="Présentation" className={styles.content}>
          <MarkdownContent skipLeadingTitle source={technology.long_description} />
        </section>
      ) : null}

      <dl className={styles.details}>
        {getDetails(technology).map(({ label, value }) => (
          <div className={styles.detail} key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {links.length > 0 ? (
        <nav aria-label="Liens officiels" className={styles.links}>
          {links.map(({ href, label }) => (
            <a href={href} key={label} rel="noreferrer" target="_blank">
              {label}
              <span className="visually-hidden"> (s’ouvre dans un nouvel onglet)</span>
            </a>
          ))}
        </nav>
      ) : null}

      <ContentSources className={styles.sources} sources={technology.source_ids} />
    </main>
  )
}
