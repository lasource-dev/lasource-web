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
  rewritten_text?: string | null
  source?: unknown
  reviewed_by?: string | null
  reviewed_at?: string | null
  rejection_reason?: string | null
}

export function validateInsightReview(data: ReviewableInsight): void {
  if (data.status === 'accepted' || data.status === 'integrated') {
    if (!data.rewritten_text?.trim()) {
      throw new Error('rewritten_text is required to accept an editorial insight')
    }
    if (!data.source) {
      throw new Error('source is required to accept an editorial insight')
    }
    if (!data.reviewed_by?.trim() || !data.reviewed_at) {
      throw new Error('reviewed_by and reviewed_at are required to accept an editorial insight')
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
