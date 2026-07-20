import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Technology } from '../../../../../payload-types'
import { readServerEnvironment } from '../../../../lib/env'
import {
  buildTechnologyMetadata,
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
    depth: 0,
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
    : 'Non vérifiée'

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
    { label: 'Fraîcheur', value: technology.freshness_status },
    { label: 'Dernière vérification', value: formatVerificationDate(technology.verified_at) },
  ].filter((detail): detail is Detail => detail !== null)

export default async function TechnologyPage({ params }: TechnologyPageProps) {
  const { slug } = await params
  const technology = await getTechnology(slug)

  if (!technology) notFound()

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

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Technologie</p>
      <h1 className={styles.title}>{technology.canonical_name}</h1>
      <p className={styles.summary}>{technology.short_description}</p>

      {aliases.length > 0 ? (
        <p className={styles.aliases}>Aussi connue sous : {aliases.join(', ')}</p>
      ) : null}

      {technology.long_description ? (
        <section aria-label="Présentation" className={styles.content}>
          {technology.long_description}
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
            </a>
          ))}
        </nav>
      ) : null}
    </main>
  )
}
