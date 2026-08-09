import { describe, expect, it } from 'vitest'

import {
  editorialWriteAccess,
  forceAutomationDraft,
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
    const result = forceAutomationDraft({
      data: { editorial_status: 'published', _status: 'published', title: 'Brouillon' },
      req: { user: { role: 'automation' } },
    } as never)

    expect(result).toMatchObject({
      editorial_status: 'draft',
      title: 'Brouillon',
      _status: 'draft',
    })
  })

  it('does not alter an administrator write', () => {
    const data = { editorial_status: 'published', _status: 'published' }
    expect(forceAutomationDraft({ data, req: { user: { role: 'admin' } } } as never)).toBe(data)
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
