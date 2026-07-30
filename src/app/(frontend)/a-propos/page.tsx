import type { Metadata } from 'next'

import styles from '../institutional.module.css'

export const metadata: Metadata = {
  alternates: { canonical: '/a-propos' },
  description:
    'Mission, méthode éditoriale et principes de confiance de LaSource.dev, plateforme de connaissances techniques structurées.',
  title: 'À propos',
}

const anchors = [
  ['mission', 'Mission'],
  ['graphe', 'Knowledge Graph'],
  ['methode', 'Processus éditorial'],
  ['ia', 'IA et experts'],
  ['mise-a-jour', 'Mises à jour'],
  ['diffusion', 'Diffusion'],
  ['reutilisation', 'Réutilisation'],
] as const

export default function AboutPage() {
  return (
    <main className={styles.page} id="contenu">
      <header className={styles.articleHeader}>
        <p className={styles.eyebrow}>À propos</p>
        <h1>La confiance se construit par la méthode, pas par l’affirmation.</h1>
        <p className={styles.lead}>
          LaSource.dev organise une connaissance technique fragmentée pour la rendre compréhensible,
          traçable et réutilisable sans masquer ses limites.
        </p>
      </header>

      <nav aria-label="Sommaire de la page" className={styles.anchorNav}>
        {anchors.map(([id, label]) => (
          <a href={`#${id}`} key={id}>
            {label}
          </a>
        ))}
      </nav>

      <section aria-labelledby="mission-title" className={styles.articleSection} id="mission">
        <h2 id="mission-title">Mission</h2>
        <div>
          <p>
            La mission de LaSource.dev est de rendre les connaissances de développement plus
            fiables, plus faciles à relier et plus simples à utiliser dans le contexte réel d’un
            projet.
          </p>
          <p>
            La documentation officielle, les dépôts, les annonces, les retours d’expérience et les
            discussions techniques sont dispersés. Les développeurs doivent souvent reconstruire
            seuls une vue cohérente, tout en évaluant la date et la qualité de chaque information.
            LaSource.dev cherche à réduire ce travail sans prétendre remplacer les sources
            originales.
          </p>
        </div>
      </section>

      <section aria-labelledby="graphe-title" className={styles.articleSection} id="graphe">
        <h2 id="graphe-title">Un Knowledge Graph central</h2>
        <div>
          <p>
            Notre modèle relie explicitement technologies, catégories, sources et relations. Une
            information n’est pas seulement publiée dans une page : elle conserve sa place dans un
            ensemble vérifiable.
          </p>
          <p>
            Cette architecture permet de produire des vues adaptées au Web, aux outils de
            développement et aux agents sans multiplier les versions concurrentes d’un même fait.
          </p>
        </div>
      </section>

      <section aria-labelledby="methode-title" className={styles.articleSection} id="methode">
        <h2 id="methode-title">Processus éditorial et validation</h2>
        <div>
          <p>
            Un contenu progresse par étapes visibles : brouillon, revue éditoriale, validation
            éditoriale et, lorsque le sujet et les personnes disponibles le permettent, validation
            par un expert identifié. Une mise à jour en cours ou un archivage sont également
            signalés.
          </p>
          <ul>
            <li>Le sujet et les sources pertinentes sont recherchés.</li>
            <li>Les affirmations importantes sont rattachées à leur provenance.</li>
            <li>Les exemples sont testés lorsqu’ils peuvent l’être de façon reproductible.</li>
            <li>La structure, la clarté et les limites du contenu sont relues.</li>
            <li>Le niveau réel de validation est affiché sans indice artificiel.</li>
          </ul>
          <p>
            Les experts interviennent pour vérifier les contenus qui nécessitent une expérience
            spécialisée. Leur participation n’est jamais sous-entendue lorsqu’aucun expert réel
            n’a validé le contenu.
          </p>
        </div>
      </section>

      <section aria-labelledby="ia-title" className={styles.articleSection} id="ia">
        <h2 id="ia-title">IA assistante, humain responsable</h2>
        <div>
          <p>
            L’intelligence artificielle peut aider à explorer un sujet, comparer des sources,
            structurer un brouillon ou détecter des incohérences. Elle n’est ni une source
            d’autorité ni une validation.
          </p>
          <p>
            La responsabilité éditoriale reste humaine. Les informations sensibles aux versions,
            les exemples et les conclusions doivent pouvoir être contrôlés à partir de sources
            accessibles.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="mise-a-jour-title"
        className={styles.articleSection}
        id="mise-a-jour"
      >
        <h2 id="mise-a-jour-title">Mise à jour et correction</h2>
        <div>
          <p>
            Les contenus techniques vieillissent. LaSource.dev conserve une date de vérification,
            un statut de fraîcheur et un historique de révision lorsque ces informations sont
            disponibles.
          </p>
          <p>
            Une erreur confirmée doit être corrigée avec transparence. Un contenu devenu incertain
            peut repasser en revue, être marqué comme en cours de mise à jour ou être archivé plutôt
            que rester présenté comme actuel.
          </p>
        </div>
      </section>

      <section aria-labelledby="diffusion-title" className={styles.articleSection} id="diffusion">
        <h2 id="diffusion-title">Une connaissance, plusieurs canaux</h2>
        <div>
          <p>
            La connaissance canonique a vocation à être diffusée sur le Web, dans les IDE, via MCP,
            des skills, une API et des agents. Chaque canal adapte la forme, mais doit préserver la
            provenance, le statut et le sens des informations.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="reutilisation-title"
        className={styles.articleSection}
        id="reutilisation"
      >
        <h2 id="reutilisation-title">Réutilisation et attribution</h2>
        <div>
          <p>
            Une citation courte est possible avec une attribution claire et un lien vers la page
            source. La citation doit respecter le sens et l’intégrité du contenu. La republication
            complète et les usages commerciaux à grande échelle nécessitent une autorisation
            préalable.
          </p>
          <p>
            LaSource.dev défend une attribution lisible et une juste rémunération des personnes qui
            produisent, vérifient et maintiennent les contenus. La diffusion automatisée ne doit pas
            rendre invisible leur contribution.
          </p>
          <p className={styles.commitment}>
            Nous ne cherchons pas à être les premiers à publier une information. Nous cherchons à
            devenir la source à laquelle les développeurs font confiance lorsqu’ils ont besoin
            d’une information fiable.
          </p>
        </div>
      </section>
    </main>
  )
}
