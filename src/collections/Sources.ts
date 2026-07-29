import type {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'

import type { Source } from '../../payload-types'
import {
  assertSourceCanBecomeNonPublic,
  prepareSourceData,
  SOURCE_EDITORIAL_STATUSES,
  SOURCE_INDEX_POLICY,
  SOURCE_TYPES,
  validateConfidenceScore,
  validateSourceURL,
} from './source/domain'

const prepareSource: CollectionBeforeValidateHook<Source> = ({ data, operation, originalDoc }) => {
  if (!data) return data
  return prepareSourceData(data, operation, originalDoc)
}

const preventInvalidatingPublishedTechnologies: CollectionBeforeChangeHook<Source> = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (
    operation !== 'update' ||
    !originalDoc?.id ||
    (data.archived !== true && data.editorial_status !== 'draft')
  ) {
    return data
  }

  const references = await req.payload.count({
    collection: 'technologies',
    overrideAccess: true,
    where: {
      and: [
        { source_ids: { contains: originalDoc.id } },
        { editorial_status: { equals: 'published' } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  assertSourceCanBecomeNonPublic(references.totalDocs)
  return data
}

export const Sources: CollectionConfig = {
  slug: 'sources',
  admin: {
    defaultColumns: ['title', 'type', 'editorial_status', 'verified_at', 'updatedAt'],
    group: 'Knowledge Core',
    useAsTitle: 'title',
  },
  access: {
    read: ({ req }) =>
      req.user
        ? true
        : {
            archived: { equals: false },
            editorial_status: { equals: 'published' },
            _status: { equals: 'published' },
          },
  },
  disableDuplicate: true,
  hooks: {
    beforeChange: [preventInvalidatingPublishedTechnologies],
    beforeValidate: [prepareSource],
  },
  labels: { plural: 'Sources', singular: 'Source' },
  versions: {
    drafts: { autosave: false, schedulePublish: false },
    maxPerDoc: 25,
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      admin: { description: 'URL canonique normalisée, sans paramètres de suivi.' },
      ...SOURCE_INDEX_POLICY.url,
      required: true,
      validate: validateSourceURL,
    },
    {
      name: 'type',
      type: 'select',
      ...SOURCE_INDEX_POLICY.type,
      options: SOURCE_TYPES.map((value) => ({ label: value, value })),
      required: true,
    },
    { name: 'title', type: 'text', maxLength: 240, required: true },
    { name: 'author', type: 'text', maxLength: 160 },
    { name: 'published_at', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    {
      name: 'confidence_score',
      type: 'number',
      defaultValue: 50,
      max: 100,
      min: 0,
      required: true,
      validate: validateConfidenceScore,
    },
    {
      name: 'verified_at',
      type: 'date',
      ...SOURCE_INDEX_POLICY.verified_at,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'editorial_status',
      type: 'select',
      defaultValue: 'draft',
      ...SOURCE_INDEX_POLICY.editorial_status,
      options: SOURCE_EDITORIAL_STATUSES.map((value) => ({ label: value, value })),
      required: true,
    },
    { name: 'archived', type: 'checkbox', defaultValue: false, required: true },
  ],
}
