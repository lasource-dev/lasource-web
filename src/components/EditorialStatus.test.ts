import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  EDITORIAL_STATUS_LABELS,
  EditorialStatus,
  type EditorialStatusValue,
} from './EditorialStatus'

describe('EditorialStatus', () => {
  it.each(Object.entries(EDITORIAL_STATUS_LABELS))(
    'affiche un libellé français pour %s',
    (status, label) => {
      const markup = renderToStaticMarkup(
        createElement(EditorialStatus, { status: status as EditorialStatusValue }),
      )

      expect(markup).toContain(label)
      expect(markup).toContain(`data-status="${status}"`)
      expect(markup).toContain('Statut éditorial')
    },
  )

  it('ajoute un marqueur textuel indépendant de la couleur', () => {
    const markup = renderToStaticMarkup(
      createElement(EditorialStatus, { status: 'archived' }),
    )

    expect(markup).toContain('■')
    expect(markup).toContain('Archivé')
  })
})
