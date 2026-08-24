import type { Metadata } from 'next'
import Link from 'next/link'

import { getApplicationPayload } from '../../lib/get-application-payload'
import styles from './institutional.module.css'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  description:
    'Le guide technique francophone de l’IA : comparateurs de prix, guides de déploiement et tutoriels sur les LLM, agents et modèles open source.',
  title: 'Guides, comparateurs et tutoriels pour construire avec l’IA',
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

const journeys = [
  ['Choisir un LLM', 'Comparer Claude, GPT et Gemini selon les besoins de votre application.', '/guides/claude-gpt-gemini-quel-llm-choisir'],
  ['RAG : des bases aux architectures avancées', 'Concevoir un pipeline RAG, puis améliorer la recherche avec le re-ranking, l’expansion de requête et le routing.', '/guides/rag-avance-reranking-query-expansion-routing'],
  ['Créer et orchestrer des agents IA', 'Comparer les frameworks d’agents et construire un agent typé avec des outils.', '/tutoriels/creer-agent-pydantic-ai-outils-types'],
  ['Déployer un modèle en local', 'Installer Ollama et choisir un modèle adapté à sa machine.', '/tutoriels/installer-configurer-ollama'],
  ['Model Context Protocol', 'Comprendre comment connecter un agent à des outils et des données.', '/guides/comprendre-model-context-protocol'],
  ['Comparer les GPU cloud', 'Comparer le matériel, les prix et les régions disponibles.', '/ressources/gpu'],
  ['Speech et agents vocaux', 'Comparer les services de transcription et de synthèse, puis construire des applications vocales.', '/guides/stt-francais-deepgram-assemblyai-whisper-comparatif'],
  ['Génération d’images', 'Comparer les modèles et API d’images, maîtriser leurs coûts et les intégrer en production.', '/guides/flux-dall-e-midjourney-comparatif-generation-images'],
  ['IA et RGPD', 'Déployer une IA conforme, choisir la résidence des données et sécuriser un pipeline RAG.', '/guides/deployer-ia-conforme-rgpd'],
  ['Observabilité des LLM', 'Tracer, évaluer et superviser les applications LLM avec les principales plateformes.', '/guides/arize-phoenix-langfuse-langsmith-comparatif'],
  ['Bases de données vectorielles', 'Comprendre la recherche vectorielle et mettre en œuvre Qdrant, Weaviate ou ChromaDB.', '/guides/qdrant-recherche-vectorielle-haute-performance'],
  ['Assistants et agents de code', 'Choisir entre Claude Code, Cursor, Aider et Cline selon son workflow de développement.', '/guides/claude-code-cursor-aider-cline-comparatif'],
  ['Modèles open-weight', 'Comparer Llama, Mistral, Gemma et Qwen, leurs licences et leurs performances.', '/guides/llama-mistral-gemma-qwen-panorama-2026'],
  ['IA pour les entreprises', 'Cadrer un projet IA, éviter les erreurs fréquentes et construire un premier produit utile.', '/guides/7-erreurs-frequentes-projet-ia'],
  ['Next.js et développement web', 'Structurer, authentifier et déployer une application Next.js moderne.', '/guides/nextjs-app-router-structurer-projet-2026'],
  ['Automatisation', 'Comparer n8n, Make et Zapier, puis connecter des LLM à ses workflows.', '/guides/n8n-make-zapier-automatiser-comparatif'],
  ['Données et embeddings', 'Choisir un modèle d’embeddings, préparer ses données et constituer un dataset métier.', '/guides/embeddings-comprendre-choisir-modele'],
  ['Sécurité des applications LLM', 'Se protéger contre le prompt injection, l’exfiltration et les usages non prévus.', '/guides/securite-applications-llm-prompt-injection'],
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
        <form action="/recherche" className={styles.searchForm} role="search">
          <label htmlFor="technology-search">Que souhaitez-vous construire ou comprendre ?</label>
          <div>
            <input
              id="technology-search"
              name="q"
              placeholder="Ex. RAG, speech, monitoring, RGPD…"
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

      <section aria-labelledby="parcours" className={styles.section}>
        <p className={styles.eyebrow}>Explorer par thème</p>
        <h2 id="parcours">Quel est votre besoin&nbsp;?</h2>
        <div className={styles.journeyGrid}>
          {journeys.map(([title, description, href]) => (
            <article className={styles.journeyCard} key={title}>
              <h3><Link href={href}>{title}</Link></h3>
              <p>{description}</p>
              <Link className={styles.cardLink} href={href}>Commencer <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="comparateurs" className={styles.comparisonSection}>
        <div>
          <p className={styles.eyebrow}>Comparer les services IA</p>
          <h2 id="comparateurs">Décidez à partir de critères concrets</h2>
          <p>Prix, matériel, région et contraintes de déploiement réunis dans des outils indépendants.</p>
        </div>
        <Link className={styles.comparatorCard} href="/ressources/gpu">
          <span>Disponible</span>
          <strong>Comparateur GPU cloud</strong>
          <small>Comparer les offres et vérifier la compatibilité d’un modèle.</small>
        </Link>
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
