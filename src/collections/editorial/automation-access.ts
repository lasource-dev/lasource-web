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

export const synchronizeEditorialStatus: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data
  if (isAutomationUser(req.user)) {
    return { ...data, editorial_status: 'draft', _status: 'draft' }
  }

  const payloadStatusChanged =
    originalDoc && data._status !== undefined && data._status !== originalDoc._status
  const editorialStatusChanged =
    originalDoc &&
    data.editorial_status !== undefined &&
    data.editorial_status !== originalDoc.editorial_status

  if (payloadStatusChanged) {
    return { ...data, editorial_status: data._status }
  }
  if (editorialStatusChanged) {
    return {
      ...data,
      _status: data.editorial_status === 'published' ? 'published' : 'draft',
    }
  }

  if (!originalDoc && data._status === 'published') {
    return { ...data, editorial_status: 'published' }
  }
  if (!originalDoc && data.editorial_status === 'published') {
    return { ...data, _status: 'published' }
  }
  if (!originalDoc && (data.editorial_status === 'draft' || data.editorial_status === 'archived')) {
    return { ...data, _status: 'draft' }
  }
  return data
}
