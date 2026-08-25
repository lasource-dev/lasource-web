import type { Payload } from 'payload'

import type { EditorialContent } from '../../../payload-types'
import { searchGitHubDiscussions, searchStackExchange } from './connectors'

export type EnrichmentPlatform = 'stack_exchange' | 'github'

type CollectionRequest = {
  article: EditorialContent
  githubToken?: string
  platforms: EnrichmentPlatform[]
  query?: string
  req: Parameters<Payload['create']>[0]['req']
}

function technologyNames(article: EditorialContent): string[] {
  return (article.technologies ?? []).flatMap((technology) =>
    typeof technology === 'string' ? [] : [technology.canonical_name],
  )
}

export function buildEnrichmentQuery(article: EditorialContent, explicitQuery?: string): string {
  if (explicitQuery?.trim()) return explicitQuery.trim()
  return [article.title, ...technologyNames(article)].join(' ').trim()
}

export async function collectEditorialInsights(
  payload: Payload,
  { article, githubToken, platforms, query: explicitQuery, req }: CollectionRequest,
): Promise<{ created: number; duplicates: number; fetched: number }> {
  const query = buildEnrichmentQuery(article, explicitQuery)
  const batches = await Promise.all(
    platforms.map((platform) =>
      platform === 'stack_exchange'
        ? searchStackExchange(query)
        : searchGitHubDiscussions(query, { token: githubToken }),
    ),
  )
  const candidates = batches.flat()
  if (candidates.length === 0) return { created: 0, duplicates: 0, fetched: 0 }

  const existing = await payload.find({
    collection: 'editorial-insights',
    depth: 0,
    limit: candidates.length,
    overrideAccess: false,
    req,
    where: {
      and: [
        { article: { equals: article.id } },
        { source_url: { in: candidates.map((candidate) => candidate.url) } },
      ],
    },
  })
  const knownURLs = new Set(existing.docs.map((insight) => insight.source_url))
  const fresh = candidates.filter((candidate) => !knownURLs.has(candidate.url))

  await Promise.all(
    fresh.map((candidate) =>
      payload.create({
        collection: 'editorial-insights',
        data: {
          article: article.id,
          collected_at: candidate.collected_at,
          collector_version: 'mvp-1',
          corroboration_count: 0,
          engagement_score: candidate.engagement_score,
          platform: candidate.platform,
          source_author: candidate.author,
          source_excerpt: candidate.excerpt,
          source_url: candidate.url,
          status: 'candidate',
          title: candidate.title,
          type: 'field_experience',
        },
        overrideAccess: false,
        req,
      }),
    ),
  )

  return {
    created: fresh.length,
    duplicates: candidates.length - fresh.length,
    fetched: candidates.length,
  }
}
