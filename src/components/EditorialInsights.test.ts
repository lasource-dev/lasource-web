import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { EditorialInsight } from '../../payload-types'
import { EditorialInsights } from './EditorialInsights'

const insight = {
  id: 'insight-1',
  platform: 'github',
  proposed_rewrite: 'Épinglez les versions utilisées en production.',
  source_url: 'https://github.com/example/repo/issues/1',
  status: 'accepted',
  title: 'Versions reproductibles',
  type: 'pitfall',
} as EditorialInsight

describe('EditorialInsights', () => {
  it('renders an accepted community insight and its source', () => {
    const html = renderToStaticMarkup(createElement(EditorialInsights, { insights: [insight] }))
    expect(html).toContain('Ce que signalent les praticiens')
    expect(html).toContain('Épinglez les versions')
    expect(html).toContain(insight.source_url)
  })

  it('prefers the final rewritten text', () => {
    const html = renderToStaticMarkup(
      createElement(EditorialInsights, {
        insights: [{ ...insight, rewritten_text: 'Texte final.' }],
      }),
    )
    expect(html).toContain('Texte final.')
    expect(html).not.toContain('Épinglez les versions')
  })
})
