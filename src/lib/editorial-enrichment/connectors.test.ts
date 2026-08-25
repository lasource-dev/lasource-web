import { describe, expect, it, vi } from 'vitest'

import { searchGitHubDiscussions, searchStackExchange } from './connectors'

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 })
}

describe('editorial enrichment connectors', () => {
  it('collects answer excerpts from Stack Exchange and ignores questions', async () => {
    let requestedURL = ''
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      requestedURL = String(input)
      return response({
        items: [
          { answer_id: 42, body: 'Use a bounded queue.', item_type: 'answer', question_id: 10, score: 8, title: 'Queues' },
          { body: 'Question body', item_type: 'question', question_id: 10, score: 20 },
        ],
      })
    })

    const results = await searchStackExchange('python queue', { fetcher: fetcher as typeof fetch })
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ external_id: '42', engagement_score: 8, url: 'https://stackoverflow.com/a/42' })
    expect(requestedURL).toContain('/search/excerpts?')
  })

  it('ranks GitHub engagement from reactions and comments', async () => {
    let requestedInit: RequestInit | undefined
    const fetcher = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      requestedInit = init
      return response({ items: [{ body: 'A production workaround', comments: 3, html_url: 'https://github.com/org/repo/issues/7', id: 7, reactions: { total_count: 5 }, title: 'Memory spike', user: { login: 'maintainer' } }] })
    })

    const results = await searchGitHubDiscussions('memory spike', { fetcher: fetcher as typeof fetch, token: 'secret' })
    expect(results[0]).toMatchObject({ author: 'maintainer', engagement_score: 8, platform: 'github' })
    expect(requestedInit?.headers).toMatchObject({ Authorization: 'Bearer secret' })
  })

  it('rejects overly broad queries', async () => {
    await expect(searchStackExchange('  x  ')).rejects.toThrow(/3 characters/)
  })
})
