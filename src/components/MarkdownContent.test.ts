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
})
