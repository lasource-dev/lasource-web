import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import type { Relation, Source, Technology } from '../../payload-types'
import {
  assertValidPublishedRelation,
  ENABLED_RELATION_TYPES,
  prepareRelationData,
  RELATION_INDEX_POLICY,
  relationshipID,
  validateRelationType,
} from './relation/domain'

const prepareRelation: CollectionBeforeValidateHook<Relation> = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data
  const prepared = prepareRelationData(data, operation, originalDoc)
  const editorialStatus = prepared.editorial_status ?? originalDoc?.editorial_status ?? 'draft'
  const archived = prepared.archived ?? originalDoc?.archived ?? false

  if (editorialStatus === 'published' && !archived) {
    const sourceID = relationshipID(prepared.source ?? originalDoc?.source)
    const targetID = relationshipID(prepared.target ?? originalDoc?.target)
    if (!sourceID || !targetID) {
      throw new Error('A Relation requires a source and target Technology')
    }

    const [source, target] = await Promise.all([
      req.payload.findByID({
        collection: 'technologies',
        id: sourceID,
        overrideAccess: true,
      }) as Promise<Technology>,
      req.payload.findByID({
        collection: 'technologies',
        id: targetID,
        overrideAccess: true,
      }) as Promise<Technology>,
    ])

    const evidenceValues = prepared.source_ids ?? originalDoc?.source_ids ?? []
    const evidence = await Promise.all(
      evidenceValues.map(async (value) => {
        if (typeof value === 'object') return value
        return (await req.payload.findByID({
          collection: 'sources',
          id: value,
          overrideAccess: true,
        })) as Source
      }),
    )

    assertValidPublishedRelation(editorialStatus, archived, source, target, evidence)
  }

  return prepared
}

export const Relations: CollectionConfig = {
  slug: 'relations',
  admin: {
    defaultColumns: ['relation_type', 'source', 'target', 'editorial_status', 'updatedAt'],
    group: 'Knowledge Core',
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
  hooks: { beforeValidate: [prepareRelation] },
  indexes: [
    { fields: ['source', 'relation_type'] },
    { fields: ['target', 'relation_type'] },
  ],
  labels: { plural: 'Relations', singular: 'Relation' },
  versions: {
    drafts: { autosave: false, schedulePublish: false },
    maxPerDoc: 25,
  },
  fields: [
    {
      name: 'source',
      type: 'relationship',
      relationTo: 'technologies',
      required: true,
    },
    {
      name: 'relation_type',
      type: 'select',
      options: ENABLED_RELATION_TYPES.map((value) => ({ label: value, value })),
      required: true,
      validate: validateRelationType,
    },
    {
      name: 'target',
      type: 'relationship',
      relationTo: 'technologies',
      required: true,
    },
    {
      name: 'canonical_key',
      type: 'text',
      admin: { hidden: true, readOnly: true },
      ...RELATION_INDEX_POLICY.canonical_key,
      required: true,
    },
    {
      name: 'source_ids',
      type: 'relationship',
      admin: { description: 'Sources qui justifient cette relation.' },
      hasMany: true,
      relationTo: 'sources',
    },
    {
      name: 'verified_at',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'editorial_status',
      type: 'select',
      defaultValue: 'draft',
      ...RELATION_INDEX_POLICY.editorial_status,
      options: [
        { label: 'draft', value: 'draft' },
        { label: 'published', value: 'published' },
      ],
      required: true,
    },
    { name: 'archived', type: 'checkbox', defaultValue: false, required: true },
  ],
}
