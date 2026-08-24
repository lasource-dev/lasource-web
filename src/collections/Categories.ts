import type {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'

import type { Category } from '../../payload-types'
import {
  assertCategoryCanBecomeNonPublic,
  assertValidCategoryParent,
  CATEGORY_INDEX_POLICY,
  prepareCategoryData,
  validateSlug,
} from './category/domain'
import { REVIEW_STATUSES } from './editorial/review'
import { editorialWriteAccess, synchronizeEditorialStatus } from './editorial/automation-access'

const prepareCategory: CollectionBeforeValidateHook<Category> = ({ data, operation, originalDoc }) => {
  if (!data) return data
  return prepareCategoryData(data, operation, originalDoc)
}

const preventInvalidatingPublishedTechnologies: CollectionBeforeChangeHook<Category> = async ({
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
        { category: { equals: originalDoc.id } },
        { editorial_status: { equals: 'published' } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  const children = await req.payload.count({
    collection: 'categories',
    overrideAccess: true,
    where: {
      and: [
        { parent_category: { equals: originalDoc.id } },
        { editorial_status: { equals: 'published' } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  assertCategoryCanBecomeNonPublic(references.totalDocs, children.totalDocs)

  return data
}

const validateParentCategory: CollectionBeforeChangeHook<Category> = async ({
  data,
  originalDoc,
  req,
}) => {
  const parentValue = data.parent_category ?? originalDoc?.parent_category
  const parentID = typeof parentValue === 'object' && parentValue !== null ? parentValue.id : parentValue
  if (!parentID) return data

  const [parent, children] = await Promise.all([
    req.payload.findByID({
      collection: 'categories',
      depth: 0,
      id: parentID,
      overrideAccess: true,
    }),
    originalDoc?.id
      ? req.payload.count({
          collection: 'categories',
          overrideAccess: true,
          where: { parent_category: { equals: originalDoc.id } },
        })
      : Promise.resolve({ totalDocs: 0 }),
  ])

  assertValidCategoryParent({
    categoryID: originalDoc?.id,
    childCount: children.totalDocs,
    parent,
    publishing:
      (data.editorial_status ?? originalDoc?.editorial_status) === 'published' &&
      data.archived !== true,
  })

  return data
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    defaultColumns: ['canonical_name', 'slug', 'editorial_status', 'archived', 'updatedAt'],
    group: 'Knowledge Core',
    useAsTitle: 'canonical_name',
  },
  access: {
    ...editorialWriteAccess,
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
    beforeChange: [validateParentCategory, preventInvalidatingPublishedTechnologies],
    beforeValidate: [synchronizeEditorialStatus, prepareCategory],
  },
  labels: { plural: 'Catégories', singular: 'Catégorie' },
  versions: {
    drafts: { autosave: false, schedulePublish: false },
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
              admin: { description: 'Généré à la création puis stable.' },
              ...CATEGORY_INDEX_POLICY.slug,
              required: true,
              validate: validateSlug,
            },
            {
              name: 'canonical_name',
              type: 'text',
              ...CATEGORY_INDEX_POLICY.canonical_name,
              maxLength: 120,
              required: true,
            },
            {
              name: 'aliases',
              type: 'array',
              fields: [{ name: 'alias', type: 'text', maxLength: 120, required: true }],
            },
            {
              name: 'parent_category',
              type: 'relationship',
              admin: {
                description: 'Catégorie parente facultative. Deux niveaux maximum.',
              },
              filterOptions: { parent_category: { exists: false } },
              index: true,
              relationTo: 'categories',
            },
          ],
        },
        {
          label: 'Description',
          fields: [
            { name: 'short_description', type: 'textarea', maxLength: 320, required: true },
            { name: 'long_description', type: 'textarea' },
          ],
        },
        {
          label: 'Gouvernance',
          fields: [
            {
              name: 'editorial_status',
              type: 'select',
              defaultValue: 'draft',
              ...CATEGORY_INDEX_POLICY.editorial_status,
              options: [
                { label: 'draft', value: 'draft' },
                { label: 'published', value: 'published' },
              ],
              required: true,
            },
            {
              name: 'review_status',
              type: 'select',
              defaultValue: 'unreviewed',
              index: true,
              options: REVIEW_STATUSES.map((value) => ({ label: value, value })),
            },
            { name: 'reviewed_at', type: 'date' },
            { name: 'reviewed_by', type: 'text', maxLength: 160 },
            { name: 'next_review_at', type: 'date' },
            { name: 'archived', type: 'checkbox', defaultValue: false, required: true },
          ],
        },
        {
          label: 'Référencement',
          fields: [
            { name: 'meta_title', type: 'text', maxLength: 60 },
            { name: 'meta_description', type: 'textarea', maxLength: 160 },
          ],
        },
      ],
    },
  ],
}
