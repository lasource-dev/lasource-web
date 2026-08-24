import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MarkdownContent } from './MarkdownContent'

describe('MarkdownContent', () => {
  it('rend titres, liens, listes et code sans injecter de HTML', () => {
    const markup = renderToStaticMarkup(
      createElement(MarkdownContent, {
        source:
          '## Tester\n\nVoir [MDN](https://developer.mozilla.org).\n\n- Un\n- Deux\n\n```js\nconst safe = true;\n```\n\n<script>alert(1)</script>',
      }),
    )

    expect(markup).toContain('<h2>Tester</h2>')
    expect(markup).toContain('<a href="https://developer.mozilla.org">MDN</a>')
    expect(markup).toContain('<ul><li>Un</li><li>Deux</li></ul>')
    expect(markup).toContain('class="language-js"')
    expect(markup).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(markup).not.toContain('<script>')
  })

  it('peut ignorer le titre Markdown déjà affiché par la page', () => {
    const markup = renderToStaticMarkup(
      createElement(MarkdownContent, {
        skipLeadingTitle: true,
        source: '# CSS\n\nUne introduction.\n\n## À apprendre',
      }),
    )

    expect(markup).not.toContain('# CSS')
    expect(markup).toContain('<p>Une introduction.</p>')
    expect(markup).toContain('<h2>À apprendre</h2>')
  })

  it('rend le gras et les tableaux Markdown', () => {
    const markup = renderToStaticMarkup(
      createElement(MarkdownContent, {
        source:
          'En août, **Cursor** mise sur l’éditeur.\n\n| Outil | Positionnement | Offre |\n|---|---|---|\n| **Claude Code** | Agent terminal | Abonnement |\n| Cursor | Éditeur IA | Gratuité limitée |',
      }),
    )

    expect(markup).toContain('<strong>Cursor</strong>')
    expect(markup).toContain('<table><thead><tr><th>Outil</th><th>Positionnement</th><th>Offre</th></tr></thead>')
    expect(markup).toContain('<td><strong>Claude Code</strong></td>')
    expect(markup).toContain('<td>Gratuité limitée</td>')
    expect(markup).not.toContain('|---|')
  })
})
