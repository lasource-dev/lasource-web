export type CollectedDiscussion = {
  external_id: string
  platform: 'stack_exchange' | 'github'
  title: string
  url: string
  author?: string
  excerpt: string
  engagement_score: number
  collected_at: string
}

type Fetcher = typeof fetch

function requiredQuery(query: string): string {
  const normalized = query.trim()
  if (normalized.length < 3) throw new Error('The enrichment query must contain at least 3 characters')
  return normalized
}

export async function searchStackExchange(
  query: string,
  options: { fetcher?: Fetcher; pageSize?: number; site?: string } = {},
): Promise<CollectedDiscussion[]> {
  const url = new URL('https://api.stackexchange.com/2.3/search/excerpts')
  url.searchParams.set('q', requiredQuery(query))
  url.searchParams.set('site', options.site ?? 'stackoverflow')
  url.searchParams.set('sort', 'votes')
  url.searchParams.set('order', 'desc')
  url.searchParams.set('pagesize', String(Math.min(options.pageSize ?? 20, 50)))

  const response = await (options.fetcher ?? fetch)(url, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`Stack Exchange search failed (${response.status})`)

  const payload = (await response.json()) as {
    backoff?: number
    items?: Array<{
      answer_id?: number
      body?: string
      item_type?: string
      owner?: { display_name?: string }
      question_id?: number
      score?: number
      title?: string
    }>
  }
  if (payload.backoff) throw new Error(`Stack Exchange requested a ${payload.backoff}s backoff`)

  const collectedAt = new Date().toISOString()
  return (payload.items ?? [])
    .filter((item) => item.item_type === 'answer' && item.answer_id && item.question_id && item.body)
    .map((item) => ({
      external_id: String(item.answer_id),
      platform: 'stack_exchange',
      title: item.title ?? `Stack Overflow answer ${item.answer_id}`,
      url: `https://stackoverflow.com/a/${item.answer_id}`,
      author: item.owner?.display_name,
      excerpt: item.body as string,
      engagement_score: item.score ?? 0,
      collected_at: collectedAt,
    }))
}

export async function searchGitHubDiscussions(
  query: string,
  options: { fetcher?: Fetcher; pageSize?: number; token?: string } = {},
): Promise<CollectedDiscussion[]> {
  const url = new URL('https://api.github.com/search/issues')
  url.searchParams.set('q', `${requiredQuery(query)} is:issue`)
  url.searchParams.set('sort', 'reactions')
  url.searchParams.set('order', 'desc')
  url.searchParams.set('per_page', String(Math.min(options.pageSize ?? 20, 50)))

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  const response = await (options.fetcher ?? fetch)(url, { headers })
  if (!response.ok) throw new Error(`GitHub search failed (${response.status})`)

  const payload = (await response.json()) as {
    items?: Array<{
      body?: string | null
      comments?: number
      html_url: string
      id: number
      reactions?: { total_count?: number }
      title: string
      user?: { login?: string }
    }>
  }
  const collectedAt = new Date().toISOString()
  return (payload.items ?? [])
    .filter((item) => item.body?.trim())
    .map((item) => ({
      external_id: String(item.id),
      platform: 'github',
      title: item.title,
      url: item.html_url,
      author: item.user?.login,
      excerpt: item.body as string,
      engagement_score: (item.reactions?.total_count ?? 0) + (item.comments ?? 0),
      collected_at: collectedAt,
    }))
}
