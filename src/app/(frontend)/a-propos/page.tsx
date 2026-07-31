import type { Metadata } from 'next'

import styles from '../institutional.module.css'

export const metadata: Metadata = {
  alternates: { canonical: '/a-propos' },
  description:
    'Découvrez comment LaSource.dev recherche, vérifie et met à jour ses contenus techniques.',
  title: 'À propos',
}

const anchors = [
  ['mission', 'Mission'],
  ['graphe', 'Organisation des contenus'],
  ['methode', 'Méthode éditoriale'],
  ['ia', 'Usage de l’IA'],
  ['mise-a-jour', 'Mises à jour'],
  ['diffusion', 'Diffusion'],
  ['reutilisation', 'Réutilisation'],
] as const

export default function AboutPage() {
  return (
    <main className={styles.page} id="contenu">
      <header className={styles.articleHeader}>
        <p className={styles.eyebrow}>À propos</p>
        <h1>Des contenus techniques plus simples à comprendre et à vérifier</h1>
        <p className={styles.lead}>
          LaSource.dev rassemble des informations dispersées, les relie à leurs sources et explique
          clairement ce qui a — ou non — été vérifié.
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
            LaSource.dev aide les développeurs à comprendre une technologie, à la comparer à ses
            alternatives et à décider si elle convient à leur projet.
          </p>
          <p>
            La documentation officielle, les dépôts, les annonces, les retours d’expérience et les
            discussions techniques sont dispersés. Il faut souvent les recouper soi-même, puis
            vérifier si les informations sont encore actuelles. Nous faisons ce travail de synthèse
            sans remplacer les sources originales.
          </p>
        </div>
      </section>

      <section aria-labelledby="graphe-title" className={styles.articleSection} id="graphe">
        <h2 id="graphe-title">Des informations reliées entre elles</h2>
        <div>
          <p>
            Chaque technologie est reliée à sa catégorie, à ses sources et aux autres outils de son
            écosystème. Ces liens permettent de retrouver plus facilement les compatibilités, les
            alternatives et les comparatifs utiles.
          </p>
          <p>
            Une même information peut ainsi être présentée sur le site ou dans d’autres outils sans
            être copiée et maintenue à plusieurs endroits.
          </p>
        </div>
      </section>

      <section aria-labelledby="methode-title" className={styles.articleSection} id="methode">
        <h2 id="methode-title">Comment un contenu est vérifié</h2>
        <div>
          <p>
            Chaque contenu affiche son niveau de relecture. Selon le sujet, il peut être relu par
            l’équipe éditoriale puis par une personne qui possède une expertise particulière. Les
            contenus en cours de mise à jour ou archivés sont également signalés.
          </p>
          <ul>
            <li>Nous recherchons les sources pertinentes.</li>
            <li>Nous indiquons la provenance des affirmations importantes.</li>
            <li>Nous testons les exemples lorsque le résultat peut être reproduit.</li>
            <li>Nous relisons la structure, la clarté et les limites du contenu.</li>
            <li>Nous affichons le niveau de validation atteint.</li>
          </ul>
          <p>
            Lorsqu’une personne experte intervient, son rôle est indiqué. En l’absence de cette
            vérification, nous ne laissons pas entendre qu’elle a eu lieu.
          </p>
        </div>
      </section>

      <section aria-labelledby="ia-title" className={styles.articleSection} id="ia">
        <h2 id="ia-title">Comment nous utilisons l’intelligence artificielle</h2>
        <div>
          <p>
            L’intelligence artificielle peut nous aider à explorer un sujet, comparer des sources,
            structurer un brouillon ou repérer des incohérences. Elle ne constitue ni une source ni
            une validation.
          </p>
          <p>
            Une personne reste responsable du contenu publié. Les informations qui dépendent d’une
            version, les exemples et les conclusions doivent pouvoir être vérifiés à partir de
            sources accessibles.
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
            Les contenus techniques vieillissent. Chaque page indique sa date de vérification et,
            lorsqu’elles sont disponibles, les principales révisions effectuées.
          </p>
          <p>
            Lorsqu’une erreur est confirmée, nous la corrigeons. Un contenu devenu incertain peut
            repasser en relecture, être signalé comme en cours de mise à jour ou être archivé.
          </p>
        </div>
      </section>

      <section aria-labelledby="diffusion-title" className={styles.articleSection} id="diffusion">
        <h2 id="diffusion-title">Au-delà du site web</h2>
        <div>
          <p>
            À terme, les contenus pourront aussi être consultés depuis des outils de développement,
            une API ou des assistants. Quel que soit le moyen d’accès, leurs sources, leur date et
            leur niveau de validation devront rester visibles.
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
            Vous pouvez citer un court extrait en mentionnant LaSource.dev et en ajoutant un lien
            vers la page concernée. La republication complète et les usages commerciaux à grande
            échelle nécessitent une autorisation préalable.
          </p>
          <p>
            Les personnes qui produisent, vérifient et maintiennent les contenus doivent rester
            clairement identifiées et justement rémunérées, y compris lorsque leur travail est
            diffusé par des outils automatisés.
          </p>
          <p className={styles.commitment}>
            Notre priorité n’est pas de publier les premiers, mais de proposer des informations que
            les développeurs peuvent comprendre et vérifier.
          </p>
        </div>
      </section>
    </main>
  )
}
