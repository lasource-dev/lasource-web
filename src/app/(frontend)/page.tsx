import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

import styles from './institutional.module.css'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  description:
    'Des fiches, guides et tutoriels clairs pour comprendre les technologies du développement web et choisir les bons outils.',
  title: 'Comprendre les technologies du développement web',
}

export const dynamic = 'force-dynamic'

const contentTypes = [
  ['Technologies', 'Comprenez le rôle, les usages et l’écosystème d’une technologie.'],
  ['Guides', 'Choisissez un outil ou une approche en fonction de votre projet.'],
  ['Tutoriels', 'Réalisez pas à pas une tâche concrète.'],
  ['Comparatifs', 'Comparez plusieurs solutions à partir de critères clairs.'],
  ['Mises à jour', 'Retrouvez les changements importants des technologies que vous utilisez.'],
  ['Ressources', 'Accédez aux documentations, dépôts et publications de référence.'],
] as const

export default async function HomePage() {
  const payload = await getPayload({ config })
  const [technologies, editorialContents] = await Promise.all([
    payload.find({
      collection: 'technologies',
      depth: 0,
      limit: 12,
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
      limit: 12,
      overrideAccess: false,
      pagination: false,
      sort: '-published_at',
      where: {
        and: [
          { editorial_status: { equals: 'published' } },
          { _status: { equals: 'published' } },
        ],
      },
    }),
  ])

  const guides = editorialContents.docs.filter(({ content_type }) => content_type === 'guide')
  const tutorials = editorialContents.docs.filter(({ content_type }) => content_type === 'tutorial')

  return (
    <main className={styles.page} id="contenu">
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Guides et références pour les développeurs</p>
        <h1>Comprendre les technologies du développement web</h1>
        <p className={styles.lead}>
          À quoi sert une technologie ? Quand l’utiliser ? Avec quoi fonctionne-t-elle, et quelles
          sont ses alternatives ? LaSource.dev rassemble des réponses claires, vérifiées et
          accompagnées de leurs sources.
        </p>
        <p className={styles.scope}>
          Langages, frameworks, outils, protocoles, intelligence artificielle et plateformes cloud.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/technologies/next-js">
            Voir un exemple de fiche
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
          }))}
          title="Technologies"
        />
        <PublicationGroup
          items={guides.map((guide) => ({
            description: guide.description,
            href: `/guides/${guide.slug}`,
            title: guide.title,
          }))}
          title="Guides"
        />
        <PublicationGroup
          items={tutorials.map((tutorial) => ({
            description: tutorial.description,
            href: `/tutoriels/${tutorial.slug}`,
            title: tutorial.title,
          }))}
          title="Tutoriels"
        />
      </section>

      <section aria-labelledby="contenus" className={styles.section}>
        <p className={styles.eyebrow}>Formats</p>
        <h2 id="contenus">Trouvez la réponse adaptée à votre besoin</h2>
        <div className={styles.cardGrid}>
          {contentTypes.map(([title, description]) => (
            <article className={styles.card} key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
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
}

function PublicationGroup({ items, title }: { items: PublicationItem[]; title: string }) {
  if (items.length === 0) return null

  return (
    <section aria-labelledby={`publications-${title.toLowerCase()}`} className={styles.publicationGroup}>
      <h3 id={`publications-${title.toLowerCase()}`}>{title}</h3>
      <div className={styles.publicationGrid}>
        {items.map((item) => (
          <article className={styles.publicationCard} key={item.href}>
            <h4>
              <Link href={item.href}>{item.title}</Link>
            </h4>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
