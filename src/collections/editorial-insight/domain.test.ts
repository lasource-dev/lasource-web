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

  it('requires a publishable text for accepted insights', () => {
    expect(() => validateInsightReview({ status: 'accepted' })).toThrow(/rewritten or proposed/)
    expect(() =>
      validateInsightReview({
        status: 'accepted',
        proposed_rewrite: 'Un retour reformulé.',
      }),
    ).not.toThrow()
  })

  it('requires a reason when rejecting a candidate', () => {
    expect(() => validateInsightReview({ status: 'rejected' })).toThrow(/rejection_reason/)
  })
})
