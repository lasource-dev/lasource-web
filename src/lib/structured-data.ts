const SITE_NAME = 'LaSource.dev'

export const buildBreadcrumbData = (
  serverURL: string,
  items: readonly { href: string; label: string }[],
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(({ href, label }, index) => ({
    '@type': 'ListItem',
    item: new URL(href, serverURL).toString(),
    name: label,
    position: index + 1,
  })),
})

export const buildArticleData = ({
  canonical,
  dateModified,
  datePublished,
  description,
  headline,
  type = 'TechArticle',
}: {
  canonical: string
  dateModified: string
  datePublished?: string | null
  description: string
  headline: string
  type?: 'Article' | 'TechArticle'
}) => ({
  '@context': 'https://schema.org',
  '@type': type,
  dateModified,
  ...(datePublished ? { datePublished } : {}),
  description,
  headline,
  inLanguage: 'fr-FR',
  mainEntityOfPage: canonical,
  publisher: { '@type': 'Organization', name: SITE_NAME, url: 'https://lasource.dev' },
  url: canonical,
})
