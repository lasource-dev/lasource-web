import { describe, expect, it } from 'vitest'

import { buildContainsSearch, normalizeSearchQuery } from './site-search'

describe('site search', () => {
  it('normalise et borne une requête', () => {
    expect(normalizeSearchQuery('  modèle   local ')).toBe('modèle local')
    expect(normalizeSearchQuery('a'.repeat(100))).toHaveLength(80)
  })

  it('conserve la première valeur d’un paramètre répété', () => {
    expect(normalizeSearchQuery(['RAG', 'agents'])).toBe('RAG')
  })

  it('construit une recherche multi-champs Payload', () => {
    expect(buildContainsSearch(['title', 'description'], 'speech')).toEqual([
      { title: { contains: 'speech' } },
      { description: { contains: 'speech' } },
    ])
  })
})
