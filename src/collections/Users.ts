import type { CollectionConfig } from 'payload'

import { isAdminUser } from './editorial/automation-access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: async ({ req }) =>
      isAdminUser(req.user) ||
      (await req.payload.count({ collection: 'users', overrideAccess: true })).totalDocs === 0,
    delete: ({ req }) => isAdminUser(req.user),
    read: ({ req }) => isAdminUser(req.user),
    update: ({ req }) => isAdminUser(req.user),
  },
  auth: { useAPIKey: true },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'admin',
      options: [
        { label: 'Administrateur', value: 'admin' },
        { label: 'Éditeur', value: 'editor' },
        { label: 'Automatisation', value: 'automation' },
      ],
      required: true,
    },
  ],
}
