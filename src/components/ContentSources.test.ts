import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { Source } from '../../payload-types'
import { ContentSources } from './ContentSources'

const source: Source = {
  _status: 'published',
  archived: false,
  confidence_score: 100,
  createdAt: '2026-07-30T00:00:00.000Z',
  editorial_status: 'published',
  id: '018f1f3d-7f1b-7a88-a91f-a22f63c596d3',
  title: 'Documentation officielle',
  type: 'documentation',
  updatedAt: '2026-07-30T00:00:00.000Z',
  url: 'https://example.test/docs',
}

describe('ContentSources', () => {
  it('affiche les sources chargées et ignore les identifiants seuls', () => {
    const markup = renderToStaticMarkup(
      createElement(ContentSources, { sources: ['source-id', { ...source, author: 'Équipe Docs' }] }),
    )

    expect(markup).toContain('Sources utilisées')
    expect(markup).toContain('Documentation officielle')
    expect(markup).toContain('Équipe Docs')
    expect(markup).not.toContain('source-id')
  })

  it('n’affiche rien lorsque les sources ne sont pas chargées', () => {
    expect(renderToStaticMarkup(createElement(ContentSources, { sources: ['source-id'] }))).toBe('')
  })
})
