export const REVIEW_STATUSES = [
  'unreviewed',
  'in_review',
  'validated',
  'update_required',
] as const

export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  in_review: 'En cours de relecture',
  unreviewed: 'En attente de relecture',
  update_required: 'Mise à jour nécessaire',
  validated: 'Validé',
}
