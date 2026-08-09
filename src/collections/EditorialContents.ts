import type { CollectionConfig } from 'payload'

import { EDITORIAL_STATUSES } from './technology/domain'
import { REVIEW_STATUSES } from './editorial/review'
import { validateSlug } from './technology/domain'
import { editorialWriteAccess, forceAutomationDraft } from './editorial/automation-access'

export const EditorialContents: CollectionConfig = {
  slug: 'editorial-contents',
  admin: {
    defaultColumns: ['title', 'content_type', 'editorial_status', 'review_status', 'updatedAt'],
    group: 'Contenus',
    useAsTitle: 'title',
  },
  access: {
    ...editorialWriteAccess,
    read: ({ req }) =>
      req.user
        ? true
        : {
            editorial_status: { equals: 'published' },
            _status: { equals: 'published' },
          },
  },
  disableDuplicate: true,
  hooks: { beforeValidate: [forceAutomationDraft] },
  versions: {
    drafts: { autosave: false, schedulePublish: false },
    maxPerDoc: 25,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      unique: true,
      validate: validateSlug,
    },
    {
      name: 'title',
      type: 'text',
      maxLength: 180,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 320,
      required: true,
    },
    {
      name: 'content_type',
      type: 'select',
      index: true,
      options: [
        { label: 'Guide', value: 'guide' },
        { label: 'Tutoriel', value: 'tutorial' },
      ],
      required: true,
    },
    {
      name: 'level',
      type: 'select',
      options: [
        { label: 'Débutant', value: 'beginner' },
        { label: 'Intermédiaire', value: 'intermediate' },
        { label: 'Avancé', value: 'advanced' },
        { label: 'Tous niveaux', value: 'all' },
      ],
      required: true,
    },
    {
      name: 'body_markdown',
      type: 'textarea',
      admin: { description: 'Contenu canonique en Markdown.' },
      required: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      hasMany: true,
      relationTo: 'categories',
    },
    {
      name: 'technologies',
      type: 'relationship',
      hasMany: true,
      relationTo: 'technologies',
    },
    {
      name: 'source_ids',
      type: 'relationship',
      hasMany: true,
      relationTo: 'sources',
      required: true,
    },
    {
      name: 'editorial_status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: EDITORIAL_STATUSES.map((value) => ({ label: value, value })),
      required: true,
    },
    {
      name: 'review_status',
      type: 'select',
      defaultValue: 'unreviewed',
      index: true,
      options: REVIEW_STATUSES.map((value) => ({ label: value, value })),
      required: true,
    },
    { name: 'published_at', type: 'date' },
    { name: 'reviewed_at', type: 'date' },
    { name: 'reviewed_by', type: 'text', maxLength: 160 },
    { name: 'next_review_at', type: 'date', required: true },
    { name: 'meta_title', type: 'text', maxLength: 60 },
    { name: 'meta_description', type: 'textarea', maxLength: 160 },
  ],
}
