import type { CollectionConfig } from 'payload'

import { isAdminUser } from './editorial/automation-access'

export const AffiliateEvents: CollectionConfig = {
  slug: 'affiliate-events',
  admin: { group: 'Monétisation', useAsTitle: 'id' },
  access: {
    create: () => false,
    delete: ({ req }) => isAdminUser(req.user),
    read: ({ req }) => isAdminUser(req.user),
    update: () => false,
  },
  fields: [
    { name: 'offer', type: 'relationship', relationTo: 'affiliate-offers', required: true },
    { name: 'content', type: 'relationship', relationTo: 'editorial-contents' },
    {
      name: 'channel',
      type: 'select',
      options: [
        { label: 'Web', value: 'web' },
        { label: 'MCP', value: 'mcp' },
        { label: 'Newsletter', value: 'newsletter' },
      ],
      required: true,
    },
    { name: 'placement', type: 'text', maxLength: 80 },
    { name: 'occurred_at', type: 'date', index: true, required: true },
  ],
  timestamps: false,
}
