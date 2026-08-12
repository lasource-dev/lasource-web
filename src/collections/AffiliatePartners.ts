import type { CollectionConfig } from 'payload'

import { isAdminUser } from './editorial/automation-access'
import { validateHTTPURL } from './technology/domain'

export const AffiliatePartners: CollectionConfig = {
  slug: 'affiliate-partners',
  admin: {
    defaultColumns: ['name', 'status', 'updatedAt'],
    group: 'Monétisation',
    useAsTitle: 'name',
  },
  access: {
    create: ({ req }) => isAdminUser(req.user),
    delete: ({ req }) => isAdminUser(req.user),
    read: ({ req }) => (req.user ? true : { status: { equals: 'active' } }),
    update: ({ req }) => isAdminUser(req.user),
  },
  fields: [
    { name: 'name', type: 'text', maxLength: 160, required: true, unique: true },
    { name: 'website_url', type: 'text', validate: validateHTTPURL },
    { name: 'logo_url', type: 'text', validate: validateHTTPURL },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      index: true,
      options: [
        { label: 'Actif', value: 'active' },
        { label: 'Inactif', value: 'inactive' },
      ],
      required: true,
    },
  ],
}
