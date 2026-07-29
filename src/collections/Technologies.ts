import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import type { Category, Source, Technology } from '../../payload-types'

import { assertValidPublishedTechnologyCategory } from './category/domain'
import { assertValidPublishedTechnologySources } from './source/domain'

import {
  EDITORIAL_STATUSES,
  FRESHNESS_STATUSES,
  TECHNOLOGY_INDEX_POLICY,
  prepareTechnologyData,
  validateHTTPURL,
  validateSlug,
} from './technology/domain'

const prepareTechnology: CollectionBeforeValidateHook<Technology> = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data
  const prepared = prepareTechnologyData(data, operation, originalDoc)
  const editorialStatus = prepared.editorial_status ?? originalDoc?.editorial_status ?? 'draft'

  if (editorialStatus === 'published') {
    const categoryValue = prepared.category ?? originalDoc?.category
    const categoryID =
      typeof categoryValue === 'object' && categoryValue !== null ? categoryValue.id : categoryValue

    if (!categoryID) {
      throw new Error('A published Technology requires a published Category')
    }

    const category = (await req.payload.findByID({
      collection: 'categories',
      id: categoryID,
      overrideAccess: true,
    })) as Category

    assertValidPublishedTechnologyCategory(editorialStatus, category)

    const sourceValues = prepared.source_ids ?? originalDoc?.source_ids ?? []
    const sources = await Promise.all(
      sourceValues.map(async (value) => {
        if (typeof value === 'object') return value
        return (await req.payload.findByID({
          collection: 'sources',
          id: value,
          overrideAccess: true,
        })) as Source
      }),
    )
    assertValidPublishedTechnologySources(editorialStatus, sources)
  }

  return prepared
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
              admin: {
                description:
                  'Généré à la création, normalisé et stable pour préserver les URLs publiques.',
              },
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
              type: 'relationship',
              admin: {
                description: 'Catégorie principale de la technologie.',
              },
              relationTo: 'categories',
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
              type: 'relationship',
              admin: {
                description: 'Sources publiées qui étayent les informations de cette technologie.',
              },
              hasMany: true,
              relationTo: 'sources',
            },
          ],
        },
      ],
    },
  ],
}
