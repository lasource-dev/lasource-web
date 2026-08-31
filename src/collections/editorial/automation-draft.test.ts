import { describe, expect, it, vi } from 'vitest'

import { saveAutomationDraft } from './automation-draft'

const request = (overrides: Record<string, unknown> = {}) => {
  const update = vi.fn().mockResolvedValue({ id: 'article-1', slug: 'guide-test' })
  return {
    json: vi.fn().mockResolvedValue({
      body_markdown: '# Version enrichie',
      editorial_status: 'published',
      slug: 'slug-interdit',
    }),
    payload: {
      logger: { error: vi.fn() },
      update,
    },
    routeParams: { id: 'article-1' },
    user: { role: 'automation' },
    ...overrides,
    update,
  }
}

describe('automated editorial drafts', () => {
  it('saves only editable fields in the versions table as an unreviewed draft', async () => {
    const req = request()
    const response = await saveAutomationDraft(req as never)

    expect(response.status).toBe(200)
    expect(req.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'editorial-contents',
        id: 'article-1',
        draft: true,
        overrideAccess: true,
        data: {
          body_markdown: '# Version enrichie',
          editorial_status: 'draft',
          review_status: 'unreviewed',
          _status: 'draft',
        },
      }),
    )
  })

  it('rejects unauthenticated requests', async () => {
    const req = request({ user: null })
    const response = await saveAutomationDraft(req as never)

    expect(response.status).toBe(401)
    expect(req.update).not.toHaveBeenCalled()
  })

  it('rejects an empty editable payload', async () => {
    const req = request({ json: vi.fn().mockResolvedValue({ slug: 'non-modifiable' }) })
    const response = await saveAutomationDraft(req as never)

    expect(response.status).toBe(400)
    expect(req.update).not.toHaveBeenCalled()
  })
})
