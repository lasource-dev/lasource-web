import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import type { Technology } from '../../payload-types'

import {
  EDITORIAL_STATUSES,
  FRESHNESS_STATUSES,
  TECHNOLOGY_INDEX_POLICY,
  prepareTechnologyData,
  validateHTTPURL,
  validateSlug,
  validateSourceID,
} from './technology/domain'

const prepareTechnology: CollectionBeforeValidateHook<Technology> = ({
  data,
  operation,
  originalDoc,
}) => {
  if (!data) return data
  return prepareTechnologyData(data, operation, originalDoc)
}

export const Technologies: CollectionConfig = {
  slug: 'technologies',
  admin: {
    defaultColumns: ['canonical_name', 'slug', 'editorial_status', 'freshness_status', 'updatedAt'],
    group: 'Knowledge Core',
    useAsTitle: 'canonical_name',
  },
  access: {
    read: ({ req }) =>
      req.user
        ? true
        : {
            editorial_status: { equals: 'published' },
            _status: { equals: 'published' },
          },
  },
  disableDuplicate: true,
  hooks: {
    beforeValidate: [prepareTechnology],
  },
  labels: {
    plural: 'Technologies',
    singular: 'Technologie',
  },
  versions: {
    drafts: {
      autosave: false,
      schedulePublish: false,
    },
    maxPerDoc: 25,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identité',
          fields: [
            {
              name: 'slug',
              type: 'text',
              admin: { description: 'Identifiant public unique, en minuscules et séparé par des tirets.' },
              ...TECHNOLOGY_INDEX_POLICY.slug,
              required: true,
              validate: validateSlug,
            },
            {
              name: 'canonical_name',
              type: 'text',
              ...TECHNOLOGY_INDEX_POLICY.canonical_name,
              maxLength: 160,
              required: true,
            },
            {
              name: 'aliases',
              type: 'array',
              admin: { description: 'Normalisés et dédupliqués sans distinction de casse.' },
              fields: [{ name: 'alias', type: 'text', maxLength: 160, required: true }],
            },
          ],
        },
        {
          label: 'Description',
          fields: [
            {
              name: 'short_description',
              type: 'textarea',
              maxLength: 320,
              required: true,
            },
            { name: 'long_description', type: 'textarea' },
            {
              name: 'category',
              type: 'text',
              admin: {
                description: "Valeur provisoire jusqu'à l'implémentation de l'issue #8 Catégorie.",
              },
              maxLength: 120,
              required: true,
            },
            { name: 'company', type: 'text', maxLength: 160 },
            { name: 'license', type: 'text', maxLength: 120 },
            { name: 'primary_language', type: 'text', maxLength: 120 },
            { name: 'founded_at', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
            { name: 'latest_version', type: 'text', maxLength: 120 },
          ],
        },
        {
          label: 'Liens officiels',
          fields: [
            {
              name: 'official_documentation_url',
              type: 'text',
              validate: validateHTTPURL,
            },
            { name: 'github_url', type: 'text', validate: validateHTTPURL },
            { name: 'official_website_url', type: 'text', validate: validateHTTPURL },
          ],
        },
        {
          label: 'Gouvernance',
          fields: [
            {
              name: 'editorial_status',
              type: 'select',
              defaultValue: 'draft',
              ...TECHNOLOGY_INDEX_POLICY.editorial_status,
              options: EDITORIAL_STATUSES.map((value) => ({ label: value, value })),
              required: true,
            },
            {
              name: 'freshness_status',
              type: 'select',
              defaultValue: 'unknown',
              ...TECHNOLOGY_INDEX_POLICY.freshness_status,
              options: FRESHNESS_STATUSES.map((value) => ({ label: value, value })),
              required: true,
            },
            {
              name: 'verified_at',
              type: 'date',
              admin: { date: { pickerAppearance: 'dayAndTime' } },
            },
          ],
        },
        {
          label: 'Référencement',
          fields: [
            { name: 'meta_title', type: 'text', maxLength: 60 },
            { name: 'meta_description', type: 'textarea', maxLength: 160 },
          ],
        },
        {
          label: 'Sources',
          fields: [
            {
              name: 'source_ids',
              type: 'array',
              admin: {
                description:
                  "Références provisoires compatibles avec la future collection Source de l'issue #9.",
              },
              fields: [
                { name: 'source_id', type: 'text', required: true, validate: validateSourceID },
                { name: 'source_url', type: 'text', validate: validateHTTPURL },
              ],
            },
          ],
        },
      ],
    },
  ],
}
