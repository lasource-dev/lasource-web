import { describe, expect, it } from 'vitest'

import type { Relation, Source, Technology } from '../../../payload-types'
import {
  assertResourceCanBecomeNonPublic,
  assertResourceCanBeDeleted,
  assertValidPublishedRelation,
  canonicalRelationKey,
  ENABLED_RELATION_TYPES,
  prepareRelationData,
  RELATION_INDEX_POLICY,
  validateRelationType,
} from './domain'

const technology = (id: string, published = true): Technology => ({
  _status: published ? 'published' : 'draft',
  canonical_name: `Technology ${id}`,
  category: 'category-id',
  createdAt: '2026-07-20T00:00:00.000Z',
  editorial_status: published ? 'published' : 'draft',
  freshness_status: 'unknown',
  id,
  short_description: 'Description',
  slug: `technology-${id}`,
  updatedAt: '2026-07-20T00:00:00.000Z',
})

const source = (id: string, published = true): Source => ({
  _status: published ? 'published' : 'draft',
  archived: false,
  confidence_score: 80,
  createdAt: '2026-07-20T00:00:00.000Z',
  editorial_status: published ? 'published' : 'draft',
  id,
  title: `Source ${id}`,
  type: 'documentation',
  updatedAt: '2026-07-20T00:00:00.000Z',
  url: `https://example.com/${id}`,
  verified_at: published ? '2026-07-20T12:00:00.000Z' : null,
})

const relation = (overrides: Partial<Relation> = {}): Relation => ({
  _status: 'draft',
  archived: false,
  canonical_key: 'uses:technology-a:technology-b',
  createdAt: '2026-07-20T00:00:00.000Z',
  editorial_status: 'draft',
  id: 'relation-id',
  relation_type: 'uses',
  source: 'technology-a',
  target: 'technology-b',
  updatedAt: '2026-07-20T00:00:00.000Z',
  ...overrides,
})

describe('Relation domain', () => {
  it('canonise les relations symétriques sans tenir compte du sens', () => {
    expect(
      canonicalRelationKey('technology-b', 'technology-a', 'compatible_with'),
    ).toBe('compatible_with:technology-a:technology-b')
    expect(
      canonicalRelationKey('technology-a', 'technology-b', 'compatible_with'),
    ).toBe('compatible_with:technology-a:technology-b')
  })

  it('conserve le sens des relations dirigées', () => {
    expect(canonicalRelationKey('technology-a', 'technology-b', 'uses')).toBe(
      'uses:technology-a:technology-b',
    )
    expect(canonicalRelationKey('technology-b', 'technology-a', 'uses')).toBe(
      'uses:technology-b:technology-a',
    )
  })

  it('réserve developed_by et expose seulement les types activés', () => {
    expect(validateRelationType('developed_by')).not.toBe(true)
    expect(ENABLED_RELATION_TYPES).not.toContain('developed_by')
    expect(validateRelationType('uses')).toBe(true)
  })

  it('refuse les auto-relations', () => {
    expect(() =>
      prepareRelationData(
        {
          relation_type: 'uses',
          source: 'technology-a',
          target: 'technology-a',
        },
        'create',
      ),
    ).toThrow('cannot link a Technology to itself')
  })

  it('calcule une clé canonique et synchronise les brouillons', () => {
    expect(
      prepareRelationData(
        {
          editorial_status: 'draft',
          relation_type: 'alternative_to',
          source: 'technology-b',
          target: 'technology-a',
        },
        'create',
      ),
    ).toMatchObject({
      _status: 'draft',
      canonical_key: 'alternative_to:technology-a:technology-b',
    })
  })

  it('rend l’identité de la relation immuable', () => {
    expect(() =>
      prepareRelationData({ source: 'technology-c' }, 'update', relation()),
    ).toThrow('Relation source is immutable')
    expect(() =>
      prepareRelationData({ target: 'technology-c' }, 'update', relation()),
    ).toThrow('Relation target is immutable')
    expect(() =>
      prepareRelationData({ relation_type: 'supports' }, 'update', relation()),
    ).toThrow('Relation type is immutable')
    expect(() =>
      prepareRelationData({ id: 'another-id' }, 'update', relation()),
    ).toThrow('Relation id is immutable')
  })

  it('exige une vérification pour publier', () => {
    expect(() =>
      prepareRelationData({ editorial_status: 'published' }, 'update', relation()),
    ).toThrow('verified_at is required')
  })

  it('exige deux Technologies et une Source publiques pour publier', () => {
    const evidence = [source('source-a')]
    expect(() =>
      assertValidPublishedRelation(
        'published',
        false,
        technology('a'),
        technology('b'),
        evidence,
      ),
    ).not.toThrow()
    expect(() =>
      assertValidPublishedRelation(
        'published',
        false,
        technology('a', false),
        technology('b'),
        evidence,
      ),
    ).toThrow('published source Technology')
    expect(() =>
      assertValidPublishedRelation(
        'published',
        false,
        technology('a'),
        technology('b'),
        [],
      ),
    ).toThrow('at least one published, active Source')
    expect(() =>
      assertValidPublishedRelation(
        'published',
        false,
        technology('a'),
        technology('b'),
        [source('source-a', false)],
      ),
    ).toThrow('at least one published, active Source')
  })

  it('protège les ressources utilisées par une relation publiée', () => {
    expect(() => assertResourceCanBecomeNonPublic(1, 'Technology')).toThrow()
    expect(() => assertResourceCanBecomeNonPublic(1, 'Source')).toThrow()
    expect(() => assertResourceCanBecomeNonPublic(0, 'Technology')).not.toThrow()
  })

  it('interdit de supprimer une ressource utilisée par une relation', () => {
    expect(() => assertResourceCanBeDeleted(1, 'Technology')).toThrow(
      'Technology used by a Relation cannot be deleted',
    )
    expect(() => assertResourceCanBeDeleted(1, 'Source')).toThrow(
      'Source used by a Relation cannot be deleted',
    )
    expect(() => assertResourceCanBeDeleted(0, 'Source')).not.toThrow()
  })

  it('déclare les index isolés strictement nécessaires', () => {
    expect(RELATION_INDEX_POLICY).toEqual({
      canonical_key: { index: true, unique: true },
      editorial_status: { index: true },
    })
  })
})
