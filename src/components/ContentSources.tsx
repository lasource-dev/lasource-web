import type { Source } from '../../payload-types'

type ContentSourcesProps = {
  className?: string
  sources: readonly (string | Source)[] | null | undefined
}

const isExpandedSource = (source: string | Source): source is Source => typeof source !== 'string'

export function ContentSources({ className, sources }: ContentSourcesProps) {
  const expandedSources = sources?.filter(isExpandedSource) ?? []

  if (expandedSources.length === 0) return null

  return (
    <section className={className}>
      <h2>Sources utilisées</h2>
      <ul>
        {expandedSources.map((source) => (
          <li key={source.id}>
            <a href={source.url} rel="noreferrer" target="_blank">
              {source.title}
              <span className="visually-hidden"> (s’ouvre dans un nouvel onglet)</span>
            </a>
            {source.author ? ` — ${source.author}` : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
