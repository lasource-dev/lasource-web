import type { CollectionConfig } from 'payload'

import { isAdminUser } from './editorial/automation-access'
import {
  AFFILIATE_RELATIONSHIPS,
  AFFILIATE_RESOURCE_TYPES,
  validateHTTPSURL,
} from './affiliate/domain'
import { validateSlug } from './technology/domain'

const labels: Record<(typeof AFFILIATE_RESOURCE_TYPES)[number], string> = {
  book: 'Livre',
  course: 'Formation',
  developer_tool: 'Outil de développement',
  cloud: 'Solution cloud',
  hosting: 'Hébergement',
  monitoring: 'Monitoring',
  certification: 'Certification',
  free_resource: 'Ressource gratuite',
}

export const AffiliateOffers: CollectionConfig = {
  slug: 'affiliate-offers',
  admin: {
    defaultColumns: ['title', 'resource_type', 'commercial_relationship', 'status', 'priority'],
    group: 'Monétisation',
    useAsTitle: 'title',
  },
  access: {
    create: ({ req }) => isAdminUser(req.user),
    delete: ({ req }) => isAdminUser(req.user),
    read: ({ req }) => (req.user ? true : { status: { equals: 'active' } }),
    update: ({ req }) => isAdminUser(req.user),
  },
  fields: [
    { name: 'slug', type: 'text', index: true, required: true, unique: true, validate: validateSlug },
    { name: 'title', type: 'text', maxLength: 180, required: true },
    {
      name: 'partner',
      type: 'relationship',
      relationTo: 'affiliate-partners',
      required: true,
    },
    {
      name: 'resource_type',
      type: 'select',
      index: true,
      options: AFFILIATE_RESOURCE_TYPES.map((value) => ({ label: labels[value], value })),
      required: true,
    },
    {
      name: 'technologies',
      type: 'relationship',
      admin: { description: 'Vide : ressource potentiellement pertinente pour toute technologie.' },
      hasMany: true,
      relationTo: 'technologies',
    },
    {
      name: 'content_types',
      type: 'select',
      admin: { description: 'Vide : guides et tutoriels.' },
      hasMany: true,
      options: [
        { label: 'Guide', value: 'guide' },
        { label: 'Tutoriel', value: 'tutorial' },
      ],
    },
    {
      name: 'levels',
      type: 'select',
      admin: { description: 'Vide : tous les niveaux.' },
      hasMany: true,
      options: [
        { label: 'Débutant', value: 'beginner' },
        { label: 'Intermédiaire', value: 'intermediate' },
        { label: 'Avancé', value: 'advanced' },
        { label: 'Tous niveaux', value: 'all' },
      ],
    },
    {
      name: 'why_recommended',
      type: 'textarea',
      admin: { description: 'Apport original de LaSource, jamais copié depuis le marchand.' },
      maxLength: 420,
      required: true,
    },
    { name: 'best_for', type: 'text', maxLength: 180, required: true },
    { name: 'limitations', type: 'textarea', maxLength: 300, required: true },
    {
      name: 'selection_basis',
      type: 'select',
      options: [
        { label: 'Testé par LaSource', value: 'tested' },
        { label: 'Évalué sur documentation', value: 'researched' },
        { label: 'Recommandé par une source experte', value: 'expert_source' },
        { label: 'Sélection éditoriale', value: 'editorial' },
      ],
      required: true,
    },
    { name: 'last_verified_at', type: 'date', required: true },
    {
      name: 'commercial_relationship',
      type: 'select',
      defaultValue: 'affiliate',
      options: AFFILIATE_RELATIONSHIPS.map((value) => ({ label: value, value })),
      required: true,
    },
    {
      name: 'destination_url',
      type: 'text',
      access: { read: ({ req }) => Boolean(req.user) },
      required: true,
      validate: validateHTTPSURL,
    },
    { name: 'cta_label', type: 'text', defaultValue: 'Découvrir la ressource', maxLength: 40, required: true },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 50,
      max: 100,
      min: 0,
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      index: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspendue', value: 'paused' },
        { label: 'Expirée', value: 'expired' },
      ],
      required: true,
    },
    { name: 'starts_at', type: 'date' },
    { name: 'ends_at', type: 'date' },
  ],
}
