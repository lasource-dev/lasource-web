import type { CollectionConfig, PayloadHandler } from 'payload'

import { EDITORIAL_STATUSES } from './technology/domain'
import { REVIEW_STATUSES } from './editorial/review'
import { validateSlug } from './technology/domain'
import { editorialWriteAccess, synchronizeEditorialStatus } from './editorial/automation-access'
import { isAdminUser, isAutomationUser } from './editorial/automation-access'
import {
  collectEditorialInsights,
  type EnrichmentPlatform,
} from '../lib/editorial-enrichment/collect'

const collectInsights: PayloadHandler = async (req) => {
  if (!isAdminUser(req.user) && !isAutomationUser(req.user)) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const id = String(req.routeParams?.id ?? '')
  if (!id) return Response.json({ error: 'Article id is required' }, { status: 400 })

  let body: { platforms?: EnrichmentPlatform[]; query?: string } = {}
  try {
    body = req.json ? ((await req.json()) as typeof body) : {}
  } catch {
    // An empty request body uses the article title and both MVP connectors.
  }

  const allowedPlatforms = new Set<EnrichmentPlatform>(['stack_exchange', 'github'])
  const platforms = body.platforms ?? ['stack_exchange', 'github']
  if (platforms.length === 0 || platforms.some((platform) => !allowedPlatforms.has(platform))) {
    return Response.json({ error: 'Invalid enrichment platform' }, { status: 400 })
  }

  try {
    const article = await req.payload.findByID({
      collection: 'editorial-contents',
      depth: 1,
      id,
      overrideAccess: false,
      req,
    })
    const result = await collectEditorialInsights(req.payload, {
      article,
      githubToken: process.env.GITHUB_TOKEN,
      platforms,
      query: body.query,
      req,
    })
    return Response.json(result, { status: 201 })
  } catch (error) {
    req.payload.logger.error({ err: error, msg: 'Editorial insight collection failed' })
    return Response.json({ error: 'Editorial insight collection failed' }, { status: 502 })
  }
}

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
  endpoints: [{ handler: collectInsights, method: 'post', path: '/:id/collect-insights' }],
  hooks: { beforeValidate: [synchronizeEditorialStatus] },
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
      name: 'pinned_affiliate_offers',
      type: 'relationship',
      admin: {
        description:
          'Sélection éditoriale prioritaire. Les ressources restent regroupées par thématique.',
      },
      hasMany: true,
      relationTo: 'affiliate-offers',
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
