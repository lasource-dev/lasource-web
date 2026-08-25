import { describe, expect, it } from 'vitest'

import { prepareAutomatedInsight, validateInsightReview } from './domain'

describe('editorial insight review', () => {
  it('forces automated submissions back to candidate status', () => {
    expect(
      prepareAutomatedInsight(
        { status: 'accepted', reviewed_by: 'robot', reviewed_at: '2026-08-25' },
        true,
      ),
    ).toMatchObject({
      status: 'candidate',
      reviewed_by: null,
      reviewed_at: null,
    })
  })

  it('requires an attributed rewrite for accepted insights', () => {
    expect(() => validateInsightReview({ status: 'accepted' })).toThrow(/rewritten_text/)
    expect(() =>
      validateInsightReview({
        status: 'accepted',
        rewritten_text: 'Un retour reformulé.',
        source: 'source-id',
        reviewed_by: 'Alexandre',
        reviewed_at: '2026-08-25T10:00:00.000Z',
      }),
    ).not.toThrow()
  })

  it('requires a reason when rejecting a candidate', () => {
    expect(() => validateInsightReview({ status: 'rejected' })).toThrow(/rejection_reason/)
  })
})
