import { describe, expect, it } from 'vitest'

import type { Technology } from '../../../payload-types'
import {
  EDITORIAL_STATUSES,
  FRESHNESS_STATUSES,
  TECHNOLOGY_INDEX_POLICY,
  normalizeAliases,
  normalizeSourceReferences,
  normalizeTechnologySlug,
  prepareTechnologyData,
  validateSlug,
} from './domain'

const technology = (overrides: Partial<Technology> = {}): Technology => ({
  _status: 'draft',
  canonical_name: 'Model Context Protocol',
  category: 'Protocole',
  createdAt: '2026-07-20T00:00:00.000Z',
  editorial_status: 'draft',
  freshness_status: 'unknown',
  id: '018f1f3d-7f1b-7a88-a91f-a22f63c596d1',
  short_description: "Un protocole ouvert pour connecter des applications d'IA à leur contexte.",
  slug: 'model-context-protocol',
  updatedAt: '2026-07-20T00:00:00.000Z',
  ...overrides,
})

describe('Technology domain', () => {
  it('prépare la création d’une technologie en brouillon', () => {
    const input: Partial<Technology> = {
      aliases: [{ alias: '  MCP  ' }, { alias: 'mcp' }],
      canonical_name: 'Model Context Protocol',
      category: 'Protocole',
      editorial_status: 'draft',
      freshness_status: 'unknown',
      short_description: 'Description',
      slug: 'model-context-protocol',
    }

    expect(prepareTechnologyData(input, 'create')).toMatchObject({
      _status: 'draft',
      aliases: [{ alias: 'MCP' }],
      slug: 'model-context-protocol',
    })
  })

  it('génère et normalise le slug à la création', () => {
    expect(
      prepareTechnologyData({ canonical_name: 'Éditeur  IA & SDK' }, 'create'),
    ).toMatchObject({ slug: 'editeur-ia-sdk' })
    expect(normalizeTechnologySlug('  LangChain.JS  ')).toBe('langchain-js')
  })

  it('préserve le slug lors du renommage et refuse sa modification', () => {
    expect(prepareTechnologyData({ canonical_name: 'Nouveau nom' }, 'update', technology()).slug).toBeUndefined()
    expect(() =>
      prepareTechnologyData({ slug: 'nouveau-slug' }, 'update', technology()),
    ).toThrow('Technology slug is immutable')
  })

  it('normalise les alias et retire le nom canonique', () => {
    expect(
      normalizeAliases(
        [
          { alias: '  LangChain   JS ' },
          { alias: 'langchain js' },
          { alias: 'LangChain' },
          { alias: '' },
        ],
        'LangChain',
      ),
    ).toEqual([{ alias: 'LangChain JS' }])

    expect(
      normalizeAliases(
        [
          { alias: ' LangChain ' },
          { alias: 'langchain' },
          { alias: 'LANGCHAIN' },
          { alias: '  LangChain   JS ' },
          { alias: 'LANGCHAIN JS' },
        ],
        'LangChain Core',
      ),
    ).toEqual([{ alias: 'LangChain' }, { alias: 'LangChain JS' }])
  })

  it('conserve les alias existants lorsqu’ils sont absents d’une mise à jour', () => {
    expect(
      prepareTechnologyData({ canonical_name: 'MCP renommé' }, 'update', technology({ aliases: [{ alias: 'MCP' }] })),
    ).not.toHaveProperty('aliases')
  })

  it('interdit de modifier l’identifiant métier', () => {
    expect(() =>
      prepareTechnologyData({ id: 'another-id' }, 'update', technology()),
    ).toThrow('Technology id is immutable')
  })

  it('synchronise le statut Payload avec le statut éditorial', () => {
    expect(prepareTechnologyData({ editorial_status: 'published' }, 'update', technology())).toMatchObject(
      { _status: 'published', editorial_status: 'published' },
    )
    expect(prepareTechnologyData({ editorial_status: 'archived' }, 'update', technology())).toMatchObject(
      { _status: 'draft', editorial_status: 'archived' },
    )
  })

  it('déclare tous les statuts de fraîcheur attendus', () => {
    expect(FRESHNESS_STATUSES).toEqual(['fresh', 'review_due', 'stale', 'unknown'])
    expect(EDITORIAL_STATUSES).toEqual(['draft', 'published', 'archived'])
  })

  it('exige une date de vérification pour un statut de fraîcheur connu', () => {
    expect(() =>
      prepareTechnologyData({ freshness_status: 'fresh', verified_at: null }, 'create'),
    ).toThrow('verified_at is required when freshness_status is known')

    expect(
      prepareTechnologyData(
        { freshness_status: 'fresh', verified_at: '2026-07-20T00:00:00.000Z' },
        'create',
      ),
    ).toMatchObject({ freshness_status: 'fresh', verified_at: '2026-07-20T00:00:00.000Z' })
  })

  it('garantit l’unicité et l’indexation du slug sans sur-indexer les sources', () => {
    expect(TECHNOLOGY_INDEX_POLICY).toEqual({
      canonical_name: { index: true },
      editorial_status: { index: true },
      freshness_status: { index: true },
      slug: { index: true, unique: true },
    })
    expect(validateSlug('langchain-js')).toBe(true)
    expect(validateSlug('LangChain JS')).not.toBe(true)
  })

  it('normalise et déduplique les références de sources provisoires', () => {
    expect(
      normalizeSourceReferences([
        { source_id: 'docs:payload', source_url: ' https://payloadcms.com/docs ' },
        { source_id: 'DOCS:PAYLOAD', source_url: 'https://example.com' },
      ]),
    ).toEqual([{ source_id: 'docs:payload', source_url: 'https://payloadcms.com/docs' }])
  })
})
