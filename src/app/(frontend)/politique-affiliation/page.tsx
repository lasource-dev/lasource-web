import type { Metadata } from 'next'

import styles from '../institutional.module.css'

export const metadata: Metadata = {
  description: 'Comment LaSource sélectionne ses ressources et utilise les liens affiliés.',
  title: 'Politique d’affiliation',
}

export default function AffiliatePolicyPage() {
  return (
    <main className={styles.page} id="contenu">
      <header className={styles.articleHeader}>
        <p className={styles.eyebrow}>Transparence</p>
        <h1>Notre politique d’affiliation</h1>
        <p className={styles.lead}>
          LaSource recommande des ressources pour leur utilité éditoriale. Certaines comportent un
          lien affilié : si vous achetez par son intermédiaire, LaSource peut recevoir une
          commission, sans surcoût pour vous.
        </p>
      </header>
      <section className={styles.articleSection}>
        <h2>Une sélection indépendante</h2>
        <div>
          <p>
            La possibilité de recevoir une commission ne suffit jamais à faire apparaître une
            ressource. Chaque recommandation indique à qui elle convient, ce qu’elle apporte et ses
            limites. Une ressource sans programme d’affiliation peut également être sélectionnée.
          </p>
        </div>
      </section>
      <section className={styles.articleSection}>
        <h2>Des relations commerciales identifiables</h2>
        <div>
          <p>
            Les liens concernés sont signalés à proximité de la recommandation. Une présence
            achetée ou un contenu sponsorisé est présenté comme une publicité, et non comme une
            sélection éditoriale indépendante.
          </p>
        </div>
      </section>
      <section className={styles.articleSection}>
        <h2>Vérification et corrections</h2>
        <div>
          <p>
            Nous indiquons la base de notre évaluation et vérifions régulièrement les ressources.
            Les prix, programmes et disponibilités peuvent néanmoins changer sur le site du
            partenaire, qui reste la référence au moment de l’achat.
          </p>
        </div>
      </section>
    </main>
  )
}
