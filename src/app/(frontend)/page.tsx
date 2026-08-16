import type { Metadata } from 'next'
import Link from 'next/link'

import { getApplicationPayload } from '../../lib/get-application-payload'
import styles from './institutional.module.css'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  description:
    'Des fiches, guides et tutoriels clairs pour comprendre les technologies du Web et de l’intelligence artificielle.',
  title: 'Comprendre les technologies du Web et de l’intelligence artificielle',
}

export const dynamic = 'force-dynamic'

const contentTypes = [
  ['Technologies', 'Comprenez le rôle, les usages et l’écosystème d’une technologie.', '/technologies'],
  ['Guides', 'Choisissez un outil ou une approche en fonction de votre projet.', '/guides'],
  ['Tutoriels', 'Réalisez pas à pas une tâche concrète.', '/tutoriels'],
  ['Comparatifs', 'Comparez plusieurs solutions à partir de critères clairs.', undefined],
  ['Mises à jour', 'Retrouvez les changements importants des technologies que vous utilisez.', undefined],
  ['Ressources GPU', 'Comparez les offres de GPU cloud par matériel, prix et région.', '/ressources/gpu'],
] as const

const formatDate = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default async function HomePage() {
  const payload = await getApplicationPayload()
  const [technologies, guides, tutorials] = await Promise.all([
    payload.find({
      collection: 'technologies',
      depth: 0,
      limit: 3,
      overrideAccess: false,
      pagination: false,
      sort: 'canonical_name',
      where: {
        and: [
          { editorial_status: { equals: 'published' } },
          { _status: { equals: 'published' } },
        ],
      },
    }),
    payload.find({
      collection: 'editorial-contents',
      depth: 0,
      limit: 3,
      overrideAccess: false,
      pagination: false,
      sort: '-published_at',
      where: {
        and: [
          { content_type: { equals: 'guide' } },
          { editorial_status: { equals: 'published' } },
          { _status: { equals: 'published' } },
        ],
      },
    }),
    payload.find({
      collection: 'editorial-contents',
      depth: 0,
      limit: 3,
      overrideAccess: false,
      pagination: false,
      sort: '-published_at',
      where: {
        and: [
          { content_type: { equals: 'tutorial' } },
          { editorial_status: { equals: 'published' } },
          { _status: { equals: 'published' } },
        ],
      },
    }),
  ])

  const featuredContent = [...guides.docs, ...tutorials.docs].sort(
    (first, second) =>
      new Date(second.published_at ?? second.updatedAt).getTime() -
      new Date(first.published_at ?? first.updatedAt).getTime(),
  )[0]
  const featuredHref = featuredContent
    ? `/${featuredContent.content_type === 'tutorial' ? 'tutoriels' : 'guides'}/${featuredContent.slug}`
    : '/technologies'

  return (
    <main className={styles.page} id="contenu">
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Web, intelligence artificielle et outils pour les développeurs</p>
        <h1>Comprendre les technologies du Web et de l’intelligence artificielle</h1>
        <p className={styles.lead}>
          À quoi sert une technologie ? Quand l’utiliser ? Avec quoi fonctionne-t-elle, et quelles
          sont ses alternatives ? LaSource.dev rassemble des réponses claires, vérifiées et
          accompagnées de leurs sources, du développement web aux modèles, agents et workflows IA.
        </p>
        <p className={styles.scope}>
          Langages, frameworks, outils, protocoles, intelligence artificielle et plateformes cloud.
        </p>
        <form action="/technologies" className={styles.searchForm} role="search">
          <label htmlFor="technology-search">Quelle technologie souhaitez-vous comprendre ?</label>
          <div>
            <input
              id="technology-search"
              name="q"
              placeholder="Ex. React, PostgreSQL, OpenAI…"
              type="search"
            />
            <button type="submit">Rechercher</button>
          </div>
        </form>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href={featuredHref}>
            {featuredContent ? `À la une : ${featuredContent.title}` : 'Explorer les technologies'}
          </Link>
          <Link className={styles.secondaryAction} href="/a-propos">
            Découvrir notre démarche
          </Link>
        </div>
      </section>

      <section aria-labelledby="recent" className={styles.recentSection}>
        <div>
          <p className={styles.eyebrow}>À découvrir</p>
          <h2 id="recent">Découvrez les derniers contenus</h2>
        </div>
        <p>
          Consultez nos premières fiches, guides et tutoriels sur les technologies du développement
          web.
        </p>
      </section>

      <section aria-label="Derniers contenus publiés" className={styles.publications}>
        <PublicationGroup
          items={technologies.docs.map((technology) => ({
            description: technology.short_description,
            href: `/technologies/${technology.slug}`,
            title: technology.canonical_name,
            updatedAt: technology.updatedAt,
          }))}
          count={technologies.totalDocs}
          href="/technologies"
          title="Technologies"
        />
        <PublicationGroup
          items={guides.docs.map((guide) => ({
            description: guide.description,
            href: `/guides/${guide.slug}`,
            title: guide.title,
            updatedAt: guide.updatedAt,
          }))}
          count={guides.totalDocs}
          href="/guides"
          title="Guides"
        />
        <PublicationGroup
          items={tutorials.docs.map((tutorial) => ({
            description: tutorial.description,
            href: `/tutoriels/${tutorial.slug}`,
            title: tutorial.title,
            updatedAt: tutorial.updatedAt,
          }))}
          count={tutorials.totalDocs}
          href="/tutoriels"
          title="Tutoriels"
        />
      </section>

      <section aria-labelledby="contenus" className={styles.section}>
        <p className={styles.eyebrow}>Formats</p>
        <h2 id="contenus">Trouvez la réponse adaptée à votre besoin</h2>
        <div className={styles.cardGrid}>
          {contentTypes.map(([title, description, href]) => (
            <article className={`${styles.card} ${href ? '' : styles.upcomingCard}`} key={title}>
              <h3>{href ? <Link href={href}>{title}</Link> : title}</h3>
              <p>{description}</p>
              {!href && <span className={styles.upcomingLabel}>Bientôt disponible</span>}
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="engagement" className={styles.splitSection}>
        <div>
          <p className={styles.eyebrow}>Engagement éditorial</p>
          <h2 id="engagement">Des contenus vérifiables et tenus à jour</h2>
        </div>
        <p>
          Chaque page indique ses sources, sa date de mise à jour et son niveau de relecture.
          Lorsque c’est pertinent, les informations sont également testées avant publication.
        </p>
      </section>

      <section aria-labelledby="newsletter" className={styles.newsletter}>
        <div>
          <p className={styles.eyebrow}>Newsletter</p>
          <h2 id="newsletter">Recevez les nouveaux contenus</h2>
          <p>Soyez informé des nouveaux guides et des mises à jour importantes.</p>
        </div>
        <span aria-disabled="true" className={styles.disabledAction}>
          Inscriptions bientôt ouvertes
        </span>
      </section>
    </main>
  )
}

type PublicationItem = {
  description: string
  href: string
  title: string
  updatedAt: string
}

function PublicationGroup({
  count,
  href,
  items,
  title,
}: {
  count: number
  href: string
  items: PublicationItem[]
  title: string
}) {
  if (items.length === 0) return null

  return (
    <section aria-labelledby={`publications-${title.toLowerCase()}`} className={styles.publicationGroup}>
      <div className={styles.publicationGroupHeader}>
        <h3 id={`publications-${title.toLowerCase()}`}>
          <Link href={href}>{title}</Link>
        </h3>
        <span aria-label={`${count} ${title.toLowerCase()}`} className={styles.publicationCount}>
          {count}
        </span>
      </div>
      <div className={styles.publicationGrid}>
        {items.map((item) => (
          <article className={styles.publicationCard} key={item.href}>
            <h4>
              <Link href={item.href}>{item.title}</Link>
            </h4>
            <p>{item.description}</p>
            <time dateTime={item.updatedAt}>Mis à jour le {formatDate.format(new Date(item.updatedAt))}</time>
          </article>
        ))}
      </div>
      <Link className={styles.viewAllLink} href={href}>
        Voir tous les {title.toLowerCase()} <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
