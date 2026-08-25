import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { EditorialContent } from '../../../payload-types'
import { collectEditorialInsights, buildEnrichmentQuery } from './collect'
import { searchGitHubDiscussions, searchStackExchange } from './connectors'

vi.mock('./connectors', () => ({
  searchGitHubDiscussions: vi.fn(),
  searchStackExchange: vi.fn(),
}))

const article = {
  id: 'article-id',
  technologies: [{ canonical_name: 'PostgreSQL' }],
  title: 'Choisir une base vectorielle',
} as EditorialContent

describe('editorial insight collection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('builds a focused query from article metadata', () => {
    expect(buildEnrichmentQuery(article)).toBe('Choisir une base vectorielle PostgreSQL')
    expect(buildEnrichmentQuery(article, ' pgvector production ')).toBe('pgvector production')
  })

  it('deduplicates candidates before creating them', async () => {
    vi.mocked(searchStackExchange).mockResolvedValue([
      {
        collected_at: '2026-08-25T10:00:00.000Z',
        engagement_score: 12,
        excerpt: 'Use an index after enough rows.',
        external_id: '42',
        platform: 'stack_exchange',
        title: 'Index trade-off',
        url: 'https://stackoverflow.com/a/42',
      },
      {
        collected_at: '2026-08-25T10:00:00.000Z',
        engagement_score: 6,
        excerpt: 'Measure recall too.',
        external_id: '43',
        platform: 'stack_exchange',
        title: 'Recall trade-off',
        url: 'https://stackoverflow.com/a/43',
      },
    ])
    const create = vi.fn()
    const payload = {
      create,
      find: vi.fn().mockResolvedValue({ docs: [{ source_url: 'https://stackoverflow.com/a/42' }] }),
    }

    const result = await collectEditorialInsights(payload as never, {
      article,
      platforms: ['stack_exchange'],
      req: {} as never,
    })

    expect(result).toEqual({ created: 1, duplicates: 1, fetched: 2 })
    expect(create).toHaveBeenCalledOnce()
    expect(create.mock.calls[0][0].data).toMatchObject({
      article: 'article-id',
      source_url: 'https://stackoverflow.com/a/43',
      status: 'candidate',
    })
  })

  it('calls only the selected connector', async () => {
    vi.mocked(searchGitHubDiscussions).mockResolvedValue([])
    const payload = { create: vi.fn(), find: vi.fn() }
    await collectEditorialInsights(payload as never, {
      article,
      platforms: ['github'],
      req: {} as never,
    })
    expect(searchGitHubDiscussions).toHaveBeenCalledOnce()
    expect(searchStackExchange).not.toHaveBeenCalled()
  })
})
