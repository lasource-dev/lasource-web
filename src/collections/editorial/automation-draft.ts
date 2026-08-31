import type { PayloadHandler, PayloadRequest } from 'payload'

import type { EditorialContent } from '../../../payload-types'
import { isAdminUser, isAutomationUser } from './automation-access'

const EDITABLE_FIELDS = [
  'title',
  'description',
  'content_type',
  'level',
  'body_markdown',
  'categories',
  'technologies',
  'pinned_affiliate_offers',
  'source_ids',
  'next_review_at',
  'meta_title',
  'meta_description',
] as const

type EditableField = (typeof EDITABLE_FIELDS)[number]
type DraftInput = Partial<Pick<EditorialContent, EditableField>>

const readDraftInput = async (req: PayloadRequest): Promise<DraftInput> => {
  const input = req.json ? ((await req.json()) as Record<string, unknown>) : {}
  return Object.fromEntries(
    EDITABLE_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(input, field)).map(
      (field) => [field, input[field]],
    ),
  ) as DraftInput
}

export const saveAutomationDraft: PayloadHandler = async (req) => {
  if (!isAdminUser(req.user) && !isAutomationUser(req.user)) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const id = String(req.routeParams?.id ?? '')
  if (!id) return Response.json({ error: 'Article id is required' }, { status: 400 })

  try {
    const data = await readDraftInput(req)
    if (Object.keys(data).length === 0) {
      return Response.json({ error: 'No editable field provided' }, { status: 400 })
    }

    const document = await req.payload.update({
      collection: 'editorial-contents',
      id,
      data: {
        ...data,
        _status: 'draft',
        editorial_status: 'draft',
        review_status: 'unreviewed',
      },
      draft: true,
      overrideAccess: true,
      req,
    })

    return Response.json(
      {
        id: document.id,
        slug: document.slug,
        status: 'draft',
      },
      { status: 200 },
    )
  } catch (error) {
    req.payload.logger.error({ err: error, msg: 'Automated editorial draft update failed' })
    return Response.json({ error: 'Draft update failed' }, { status: 500 })
  }
}
