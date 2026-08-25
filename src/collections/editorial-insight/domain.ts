export const INSIGHT_PLATFORMS = ['stack_exchange', 'github'] as const

export const INSIGHT_TYPES = [
  'field_experience',
  'pitfall',
  'opinion',
  'benchmark',
  'technical_fact',
] as const

export const INSIGHT_STATUSES = ['candidate', 'accepted', 'rejected', 'integrated'] as const

export const INSIGHT_PLACEMENTS = [
  'field_note',
  'warning',
  'diverging_view',
  'inline_note',
] as const

export type InsightStatus = (typeof INSIGHT_STATUSES)[number]

type ReviewableInsight = {
  status?: InsightStatus | null
  proposed_rewrite?: string | null
  rewritten_text?: string | null
  rejection_reason?: string | null
}

export function validateInsightReview(data: ReviewableInsight): void {
  if (data.status === 'accepted' || data.status === 'integrated') {
    if (!data.rewritten_text?.trim() && !data.proposed_rewrite?.trim()) {
      throw new Error('A rewritten or proposed text is required to accept an editorial insight')
    }
  }

  if (data.status === 'rejected' && !data.rejection_reason?.trim()) {
    throw new Error('rejection_reason is required to reject an editorial insight')
  }
}

export function prepareAutomatedInsight<T extends Record<string, unknown>>(
  data: T,
  isAutomation: boolean,
): T {
  if (!isAutomation) return data

  return {
    ...data,
    status: 'candidate',
    reviewed_at: null,
    reviewed_by: null,
    rejection_reason: null,
  }
}
