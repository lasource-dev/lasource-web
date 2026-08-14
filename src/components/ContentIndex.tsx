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
  search,
  title,
}: {
  description: string
  items: readonly ContentIndexItem[]
  search?: string
  title: string
}) {
  return (
    <main className={styles.page} id="contenu">
      <header className={styles.articleHeader}>
        <p className={styles.eyebrow}>Répertoire</p>
        <h1>{title}</h1>
        <p className={styles.lead}>{description}</p>
      </header>
      {search !== undefined && (
        <form action="/technologies" className={styles.indexSearchForm} role="search">
          <label htmlFor="index-technology-search">Rechercher une technologie</label>
          <div>
            <input
              defaultValue={search}
              id="index-technology-search"
              name="q"
              placeholder="Ex. React, PostgreSQL, OpenAI…"
              type="search"
            />
            <button type="submit">Rechercher</button>
          </div>
        </form>
      )}
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
      {items.length === 0 && search && (
        <p className={styles.emptyState}>Aucune technologie ne correspond à « {search} ».</p>
      )}
    </main>
  )
}
