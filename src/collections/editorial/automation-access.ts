import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

type UserWithRole = { role?: string | null }

export const isAutomationUser = (user: unknown): boolean =>
  Boolean(user && typeof user === 'object' && (user as UserWithRole).role === 'automation')

export const isAdminUser = (user: unknown): boolean =>
  Boolean(user && typeof user === 'object' && (user as UserWithRole).role === 'admin')

export const editorialWriteAccess: NonNullable<CollectionConfig['access']> = {
  create: ({ req }) => Boolean(req.user),
  delete: ({ req }) => Boolean(req.user) && !isAutomationUser(req.user),
  update: ({ req }) =>
    isAutomationUser(req.user)
      ? { editorial_status: { equals: 'draft' }, _status: { equals: 'draft' } }
      : Boolean(req.user),
}

export const forceAutomationDraft: CollectionBeforeValidateHook = ({ data, req }) => {
  if (!data || !isAutomationUser(req.user)) return data
  return { ...data, editorial_status: 'draft', _status: 'draft' }
}
