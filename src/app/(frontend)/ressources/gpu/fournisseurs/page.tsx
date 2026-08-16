import type { Metadata } from 'next'
import Link from 'next/link'

import { GPU_PROVIDERS } from '../providers'
import styles from '../provider.module.css'

export const metadata: Metadata = {
  alternates: { canonical: '/ressources/gpu/fournisseurs' },
  description: 'Découvrez et comparez les fournisseurs de GPU cloud : services, points forts, couverture et tarifs.',
  title: 'Fournisseurs de GPU cloud',
}

export default function GPUProvidersPage() {
  return <main className={styles.page} id="contenu">
    <nav aria-label="Fil d’Ariane" className={styles.breadcrumb}><Link href="/ressources/gpu">Ressources GPU</Link><span>/</span> Fournisseurs</nav>
    <header className={styles.hero}>
      <p className={styles.eyebrow}>Annuaire GPU cloud</p>
      <h1>Choisir son fournisseur, au-delà du prix</h1>
      <p>Découvrez les services, points forts, limites et zones couvertes par {GPU_PROVIDERS.length} fournisseurs. Les tarifs observés sont affichés sur chaque fiche.</p>
    </header>
    <section className={styles.directory} aria-label="Liste des fournisseurs">
      {GPU_PROVIDERS.map((provider) => <article className={styles.card} key={provider.slug}>
        <div><p className={styles.location}>{provider.headquarters}</p><h2>{provider.name}</h2></div>
        <p>{provider.summary}</p>
        <dl><div><dt>Couverture</dt><dd>{provider.regions}</dd></div><div><dt>Usage conseillé</dt><dd>{provider.services.slice(0, 2).join(' · ')}</dd></div></dl>
        <Link href={`/ressources/gpu/fournisseurs/${provider.slug}`}>Voir la fiche et les tarifs <span aria-hidden="true">→</span></Link>
      </article>)}
    </section>
  </main>
}
