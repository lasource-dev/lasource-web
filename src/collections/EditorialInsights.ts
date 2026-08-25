import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { isAdminUser, isAutomationUser } from './editorial/automation-access'
import {
  INSIGHT_PLACEMENTS,
  INSIGHT_PLATFORMS,
  INSIGHT_STATUSES,
  INSIGHT_TYPES,
  prepareAutomatedInsight,
  validateInsightReview,
} from './editorial-insight/domain'

const prepareInsight: CollectionBeforeValidateHook = ({ data, originalDoc, req }) => {
  if (!data) return data

  const prepared = prepareAutomatedInsight(data, isAutomationUser(req.user))
  validateInsightReview({ ...originalDoc, ...prepared })
  return prepared
}

export const EditorialInsights: CollectionConfig = {
  slug: 'editorial-insights',
  admin: {
    defaultColumns: ['article', 'platform', 'type', 'status', 'collected_at'],
    group: 'Contenus',
    useAsTitle: 'title',
  },
  access: {
    create: ({ req }) => isAdminUser(req.user) || isAutomationUser(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) =>
      isAutomationUser(req.user) ? { status: { equals: 'candidate' } } : isAdminUser(req.user),
    delete: ({ req }) => isAdminUser(req.user),
  },
  hooks: { beforeValidate: [prepareInsight] },
  fields: [
    { name: 'title', type: 'text', maxLength: 240, required: true },
    {
      name: 'article',
      type: 'relationship',
      index: true,
      relationTo: 'editorial-contents',
      required: true,
    },
    {
      name: 'platform',
      type: 'select',
      index: true,
      options: INSIGHT_PLATFORMS.map((value) => ({ label: value, value })),
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: INSIGHT_TYPES.map((value) => ({ label: value, value })),
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'candidate',
      index: true,
      options: INSIGHT_STATUSES.map((value) => ({ label: value, value })),
      required: true,
    },
    { name: 'source_url', type: 'text', index: true, required: true },
    { name: 'source_author', type: 'text', maxLength: 160 },
    {
      name: 'source_excerpt',
      type: 'textarea',
      admin: { description: 'Passage justificatif interne. Ne pas publier automatiquement.' },
      required: true,
    },
    {
      name: 'proposed_rewrite',
      type: 'textarea',
      admin: { description: "Suggestion facultative de l'automatisation, à contrôler intégralement." },
    },
    { name: 'rewritten_text', type: 'textarea' },
    {
      name: 'source',
      type: 'relationship',
      admin: { description: "Obligatoire avant l'acceptation." },
      relationTo: 'sources',
    },
    {
      name: 'placement',
      type: 'select',
      options: INSIGHT_PLACEMENTS.map((value) => ({ label: value, value })),
    },
    { name: 'technology_context', type: 'text', maxLength: 240 },
    { name: 'engagement_score', type: 'number', min: 0 },
    { name: 'corroboration_count', type: 'number', defaultValue: 0, min: 0, required: true },
    { name: 'collected_at', type: 'date', defaultValue: () => new Date().toISOString(), required: true },
    { name: 'reviewed_at', type: 'date' },
    { name: 'reviewed_by', type: 'text', maxLength: 160 },
    { name: 'rejection_reason', type: 'textarea' },
    { name: 'collector_version', type: 'text', maxLength: 80 },
  ],
  timestamps: true,
}
