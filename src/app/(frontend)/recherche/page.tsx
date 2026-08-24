import type { Metadata } from 'next'
import Link from 'next/link'

import { getApplicationPayload } from '../../../lib/get-application-payload'
import { buildContainsSearch, normalizeSearchQuery } from '../../../lib/site-search'
import styles from '../institutional.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: '/recherche' },
  description: 'Recherchez dans les technologies, guides, tutoriels et ressources recommandées par LaSource.dev.',
  robots: { index: false, follow: true },
  title: 'Recherche',
}

type SearchResult = {
  description: string
  href: string
  label: string
  title: string
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const query = normalizeSearchQuery((await searchParams).q)
  const payload = await getApplicationPayload()

  const [technologies, contents, offers] = query
    ? await Promise.all([
        payload.find({
          collection: 'technologies',
          depth: 0,
          limit: 30,
          overrideAccess: false,
          pagination: false,
          sort: 'canonical_name',
          where: {
            and: [
              { editorial_status: { equals: 'published' } },
              { _status: { equals: 'published' } },
              { or: buildContainsSearch(['canonical_name', 'short_description', 'long_description', 'aliases.alias'], query) },
            ],
          },
        }),
        payload.find({
          collection: 'editorial-contents',
          depth: 0,
          limit: 60,
          overrideAccess: false,
          pagination: false,
          sort: '-published_at',
          where: {
            and: [
              { editorial_status: { equals: 'published' } },
              { _status: { equals: 'published' } },
              { or: buildContainsSearch(['title', 'description', 'body_markdown'], query) },
            ],
          },
        }),
        payload.find({
          collection: 'affiliate-offers',
          depth: 0,
          limit: 30,
          overrideAccess: false,
          pagination: false,
          sort: '-priority',
          where: {
            and: [
              { status: { equals: 'active' } },
              { or: buildContainsSearch(['title', 'why_recommended', 'best_for', 'limitations'], query) },
            ],
          },
        }),
      ])
    : [{ docs: [] }, { docs: [] }, { docs: [] }]

  const results: SearchResult[] = [
    ...technologies.docs.map((technology) => ({
      description: technology.short_description,
      href: `/technologies/${technology.slug}`,
      label: 'Technologie',
      title: technology.canonical_name,
    })),
    ...contents.docs.map((content) => ({
      description: content.description,
      href: `/${content.content_type === 'tutorial' ? 'tutoriels' : 'guides'}/${content.slug}`,
      label: content.content_type === 'tutorial' ? 'Tutoriel' : 'Guide',
      title: content.title,
    })),
    ...offers.docs.map((offer) => ({
      description: offer.why_recommended,
      href: `/go/${offer.slug}?${new URLSearchParams({ placement: 'search', ref: query, src: 'web' })}`,
      label: offer.commercial_relationship === 'affiliate' ? 'Ressource · lien affilié' : 'Ressource',
      title: offer.title,
    })),
  ]

  return (
    <main className={styles.page} id="contenu">
      <header className={styles.articleHeader}>
        <p className={styles.eyebrow}>Tout LaSource.dev</p>
        <h1>Rechercher</h1>
        <p className={styles.lead}>
          Technologies, guides, tutoriels et ressources recommandées dans un même moteur.
        </p>
      </header>
      <form action="/recherche" className={styles.indexSearchForm} role="search">
        <label htmlFor="global-search">Que souhaitez-vous construire ou comprendre ?</label>
        <div>
          <input autoFocus defaultValue={query} id="global-search" name="q" placeholder="Ex. RAG, speech, monitoring, RGPD…" type="search" />
          <button type="submit">Rechercher</button>
        </div>
      </form>

      {query && (
        <p aria-live="polite" className={styles.resultSummary}>
          {results.length} résultat{results.length === 1 ? '' : 's'} pour « {query} »
        </p>
      )}
      <section aria-label="Résultats de recherche" className={styles.searchResults}>
        {results.map((result) => (
          <article className={styles.searchResult} key={`${result.label}-${result.href}`}>
            <p className={styles.resultType}>{result.label}</p>
            <h2><Link href={result.href}>{result.title}</Link></h2>
            <p>{result.description}</p>
          </article>
        ))}
      </section>
      {query && results.length === 0 && (
        <p className={styles.emptyState}>Aucun contenu ne correspond encore à « {query} ».</p>
      )}
      {!query && <p className={styles.emptyState}>Saisissez un sujet, un outil ou un problème à résoudre.</p>}
    </main>
  )
}
