import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

import { EditorialStatus } from '../../components/EditorialStatus'

import styles from './institutional.module.css'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  description:
    'Une connaissance technique structurée, sourcée et maintenue pour comprendre les technologies et leurs relations.',
  title: 'Comprendre les technologies avec une information fiable',
}

export const dynamic = 'force-dynamic'

const contentTypes = [
  ['Technologies', 'Des fiches de référence reliées à leurs sources et à leur écosystème.'],
  ['Catégories', 'Des repères stables pour situer les outils et leurs usages.'],
  ['Guides et tutoriels', 'Des parcours pratiques conçus pour résoudre un besoin précis.'],
  ['Comparatifs', 'Des critères explicites pour éclairer les choix techniques.'],
  ['Releases', 'Les évolutions importantes replacées dans leur contexte.'],
  ['Ressources', 'Documentation, dépôts et publications utiles, avec leur provenance.'],
] as const

const channels = ['Web', 'IDE', 'MCP', 'Skills', 'API', 'Agents IA'] as const

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
        <p className={styles.eyebrow}>La référence des technologies de développement</p>
        <h1>Tout ce qu’il faut pour comprendre une technologie, au même endroit.</h1>
        <p className={styles.lead}>
          Présentation, usages, compatibilités, alternatives, versions et sources : une connaissance
          structurée, vérifiée et maintenue dans le temps.
        </p>
        <p className={styles.scope}>
          Frameworks, langages, modèles d’IA, SDK, outils, protocoles et plateformes cloud.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/technologies/next-js">
            Voir une fiche Technologie
          </Link>
          <Link className={styles.secondaryAction} href="/a-propos">
            Comprendre notre démarche
          </Link>
        </div>
      </section>

      <section aria-labelledby="plateforme" className={styles.splitSection}>
        <div>
          <p className={styles.eyebrow}>La plateforme</p>
          <h2 id="plateforme">Une même connaissance, plusieurs façons de l’utiliser</h2>
        </div>
        <p>
          LaSource.dev organise la connaissance technique comme un ensemble de ressources
          identifiées, reliées et sourcées. Le site en est la première interface. Les autres
          canaux réutiliseront la même base canonique plutôt que des copies divergentes.
        </p>
      </section>

      <section aria-labelledby="contenus" className={styles.section}>
        <p className={styles.eyebrow}>Ce que vous y trouverez</p>
        <h2 id="contenus">Des contenus conçus pour se compléter</h2>
        <div className={styles.cardGrid}>
          {contentTypes.map(([title, description]) => (
            <article className={styles.card} key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="graphe" className={styles.graphSection}>
        <div>
          <p className={styles.eyebrow}>Knowledge Graph</p>
          <h2 id="graphe">Le contexte compte autant que la fiche</h2>
        </div>
        <div>
          <p>
            Une technologie n’existe pas seule. Elle appartient à une catégorie, s’appuie sur des
            sources et entretient des relations explicites avec d’autres technologies.
          </p>
          <p>
            Ce graphe permet de construire progressivement des compatibilités, des alternatives,
            des comparatifs et des parcours sans dupliquer les faits.
          </p>
        </div>
      </section>

      <section aria-labelledby="engagement" className={styles.splitSection}>
        <div>
          <p className={styles.eyebrow}>Engagement éditorial</p>
          <h2 id="engagement">La vitesse ne remplace pas la vérification</h2>
        </div>
        <p>
          Les contenus ont vocation à être recherchés, testés lorsque leur nature le permet, relus
          et validés avant d’être présentés comme fiables. Leur statut, leur fraîcheur et leurs
          sources doivent rester visibles.
        </p>
      </section>

      <section aria-labelledby="acces" className={styles.section}>
        <p className={styles.eyebrow}>Accès</p>
        <h2 id="acces">Disponible là où les développeurs travaillent</h2>
        <p className={styles.sectionIntro}>
          La diffusion progressera sans changer de source de vérité.
        </p>
        <ul className={styles.channelList}>
          {channels.map((channel) => (
            <li key={channel}>{channel}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent" className={styles.recentSection}>
        <div>
          <p className={styles.eyebrow}>À découvrir maintenant</p>
          <h2 id="recent">Les premiers contenus sont en ligne</h2>
        </div>
        <p>
          Parcourez les premières fiches, guides et tutoriels. Chaque page affiche clairement son
          niveau de validation éditoriale et les sources utilisées.
        </p>
      </section>

      <section aria-label="Premiers contenus publiés" className={styles.publications}>
        <PublicationGroup
          items={technologies.docs.map((technology) => ({
            description: technology.short_description,
            href: `/technologies/${technology.slug}`,
            status: technology.review_status ?? 'unreviewed',
            title: technology.canonical_name,
          }))}
          title="Technologies"
        />
        <PublicationGroup
          items={guides.map((guide) => ({
            description: guide.description,
            href: `/guides/${guide.slug}`,
            status: guide.review_status ?? 'unreviewed',
            title: guide.title,
          }))}
          title="Guides"
        />
        <PublicationGroup
          items={tutorials.map((tutorial) => ({
            description: tutorial.description,
            href: `/tutoriels/${tutorial.slug}`,
            status: tutorial.review_status ?? 'unreviewed',
            title: tutorial.title,
          }))}
          title="Tutoriels"
        />
      </section>

      <section aria-labelledby="newsletter" className={styles.newsletter}>
        <div>
          <p className={styles.eyebrow}>Newsletter</p>
          <h2 id="newsletter">Suivre les prochaines publications</h2>
          <p>
            Une newsletter sobre annoncera les nouveaux dossiers et les mises à jour importantes.
          </p>
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
  status: Parameters<typeof EditorialStatus>[0]['status']
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
            <EditorialStatus status={item.status} />
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
