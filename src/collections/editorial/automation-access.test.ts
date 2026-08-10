import { describe, expect, it } from 'vitest'

import {
  editorialWriteAccess,
  synchronizeEditorialStatus,
  isAdminUser,
  isAutomationUser,
} from './automation-access'

describe('automation editorial access', () => {
  it('identifies explicit roles only', () => {
    expect(isAutomationUser({ role: 'automation' })).toBe(true)
    expect(isAutomationUser({ role: 'admin' })).toBe(false)
    expect(isAdminUser({ role: 'admin' })).toBe(true)
    expect(isAdminUser(undefined)).toBe(false)
  })

  it('forces automated writes to remain drafts', () => {
    const result = synchronizeEditorialStatus({
      data: { editorial_status: 'published', _status: 'published', title: 'Brouillon' },
      req: { user: { role: 'automation' } },
    } as never)

    expect(result).toMatchObject({
      editorial_status: 'draft',
      title: 'Brouillon',
      _status: 'draft',
    })
  })

  it('synchronizes the business status when an administrator publishes', () => {
    expect(
      synchronizeEditorialStatus({
        data: { editorial_status: 'draft', _status: 'published' },
        originalDoc: { editorial_status: 'draft', _status: 'draft' },
        req: { user: { role: 'admin' } },
      } as never),
    ).toMatchObject({ editorial_status: 'published', _status: 'published' })
  })

  it('synchronizes the Payload status when an administrator changes the business status', () => {
    expect(
      synchronizeEditorialStatus({
        data: { editorial_status: 'published', _status: 'draft' },
        originalDoc: { editorial_status: 'draft', _status: 'draft' },
        req: { user: { role: 'admin' } },
      } as never),
    ).toMatchObject({ editorial_status: 'published', _status: 'published' })
  })

  it('keeps an archived resource unpublished', () => {
    expect(
      synchronizeEditorialStatus({
        data: { editorial_status: 'archived', _status: 'published' },
        originalDoc: { editorial_status: 'published', _status: 'published' },
        req: { user: { role: 'admin' } },
      } as never),
    ).toMatchObject({ editorial_status: 'archived', _status: 'draft' })
  })

  it('does not mistake Payload-injected unchanged values for an explicit status change', () => {
    const data = { editorial_status: 'draft', _status: 'draft', title: 'Titre corrigé' }
    expect(
      synchronizeEditorialStatus({
        data,
        originalDoc: { editorial_status: 'draft', _status: 'draft' },
        req: { user: { role: 'admin' } },
      } as never),
    ).toBe(data)
  })

  it('limits automated updates to unpublished documents', async () => {
    const update = editorialWriteAccess.update
    if (!update) throw new Error('update access is required')

    expect(await update({ req: { user: { role: 'automation' } } } as never)).toEqual({
      editorial_status: { equals: 'draft' },
      _status: { equals: 'draft' },
    })
    expect(await update({ req: { user: { role: 'admin' } } } as never)).toBe(true)
  })
})
