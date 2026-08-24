import Link from 'next/link'

import styles from '../app/(frontend)/institutional.module.css'

export type ContentIndexItem = {
  description: string
  href: string
  title: string
}

export type ContentIndexFilter = {
  active?: boolean
  href: string
  label: string
}

export type ContentIndexFilterGroup = {
  ariaLabel: string
  filters: readonly ContentIndexFilter[]
  label: string
}

export function ContentIndex({
  description,
  filterGroups,
  items,
  search,
  title,
}: {
  description: string
  filterGroups?: readonly ContentIndexFilterGroup[]
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
      {(search !== undefined || (filterGroups && filterGroups.length > 0)) && (
        <div className={styles.indexSearchArea}>
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
          {filterGroups?.map((group) => (
            <nav aria-label={group.ariaLabel} className={styles.indexFilters} key={group.label}>
              <span>{group.label}</span>
              <div>
                {group.filters.map((filter) => (
                  <Link
                    aria-current={filter.active ? 'page' : undefined}
                    className={filter.active ? styles.activeFilter : undefined}
                    href={filter.href}
                    key={filter.href}
                  >
                    {filter.label}
                  </Link>
                ))}
              </div>
            </nav>
          ))}
        </div>
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
