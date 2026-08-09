import Link from 'next/link'

import styles from '../app/(frontend)/institutional.module.css'

export type ContentIndexItem = {
  description: string
  href: string
  title: string
}

export function ContentIndex({
  description,
  items,
  title,
}: {
  description: string
  items: readonly ContentIndexItem[]
  title: string
}) {
  return (
    <main className={styles.page} id="contenu">
      <header className={styles.articleHeader}>
        <p className={styles.eyebrow}>Répertoire</p>
        <h1>{title}</h1>
        <p className={styles.lead}>{description}</p>
      </header>
      <section aria-label={`Liste des ${title.toLowerCase()}`} className={styles.publicationGrid}>
        {items.map((item) => (
          <article className={styles.publicationCard} key={item.href}>
            <h2>
              <Link href={item.href}>{item.title}</Link>
            </h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
