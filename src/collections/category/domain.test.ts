import { describe, expect, it } from 'vitest'

import type { Category } from '../../../payload-types'
import {
  assertCategoryCanBecomeNonPublic,
  assertValidPublishedTechnologyCategory,
  CATEGORY_INDEX_POLICY,
  isPublishedCategory,
  normalizeCategorySlug,
  prepareCategoryData,
} from './domain'

const category = (overrides: Partial<Category> = {}): Category => ({
  _status: 'draft',
  archived: false,
  canonical_name: 'Framework',
  createdAt: '2026-07-20T00:00:00.000Z',
  editorial_status: 'draft',
  id: '018f1f3d-7f1b-7a88-a91f-a22f63c596d2',
  short_description: 'Bibliothèque qui structure une application.',
  slug: 'framework',
  updatedAt: '2026-07-20T00:00:00.000Z',
  ...overrides,
})

describe('Category domain', () => {
  it('crée un brouillon et génère un slug normalisé', () => {
    expect(
      prepareCategoryData(
        {
          canonical_name: 'Base de données vectorielle',
          editorial_status: 'draft',
          short_description: 'Description',
        },
        'create',
      ),
    ).toMatchObject({ _status: 'draft', slug: 'base-de-donnees-vectorielle' })
    expect(normalizeCategorySlug('  LLM & IA  ')).toBe('llm-ia')
  })

  it('rend l’UUID et le slug immuables après création', () => {
    expect(() =>
      prepareCategoryData({ id: 'another-id' }, 'update', category()),
    ).toThrow('Category id is immutable')
    expect(() =>
      prepareCategoryData({ slug: 'sdk' }, 'update', category()),
    ).toThrow('Category slug is immutable')
    expect(prepareCategoryData({ canonical_name: 'Framework applicatif' }, 'update', category()).slug)
      .toBeUndefined()
  })

  it('normalise les alias avec le helper partagé', () => {
    expect(
      prepareCategoryData(
        { aliases: [{ alias: ' Framework ' }, { alias: 'framework' }, { alias: ' Cadriciel ' }] },
        'update',
        category({ canonical_name: 'Bibliothèque' }),
      ).aliases,
    ).toEqual([{ alias: 'Framework' }, { alias: 'Cadriciel' }])
  })

  it('gère publication et archivage', () => {
    const published = prepareCategoryData(
      { editorial_status: 'published' },
      'update',
      category(),
    )
    expect(published._status).toBe('published')
    expect(
      prepareCategoryData({ archived: true }, 'update', category({ ...published }))._status,
    ).toBe('draft')
  })

  it('reconnaît uniquement une catégorie publique active', () => {
    expect(isPublishedCategory(category({ _status: 'published', editorial_status: 'published' }))).toBe(true)
    expect(isPublishedCategory(category({ _status: 'draft', editorial_status: 'published' }))).toBe(false)
    expect(isPublishedCategory(category({ _status: 'published', archived: true, editorial_status: 'published' }))).toBe(false)
  })

  it('interdit la publication d’une technologie sans catégorie publique active', () => {
    expect(() => assertValidPublishedTechnologyCategory('published', null)).toThrow()
    expect(() =>
      assertValidPublishedTechnologyCategory('published', category()),
    ).toThrow()
    expect(() =>
      assertValidPublishedTechnologyCategory(
        'published',
        category({ _status: 'published', archived: true, editorial_status: 'published' }),
      ),
    ).toThrow()
    expect(() =>
      assertValidPublishedTechnologyCategory(
        'published',
        category({ _status: 'published', editorial_status: 'published' }),
      ),
    ).not.toThrow()
  })

  it('interdit d’archiver ou dépublier une catégorie encore utilisée publiquement', () => {
    expect(() => assertCategoryCanBecomeNonPublic(1)).toThrow(
      'A Category used by a published Technology cannot be archived or unpublished',
    )
    expect(() => assertCategoryCanBecomeNonPublic(0)).not.toThrow()
  })

  it('déclare seulement les index Category utiles', () => {
    expect(CATEGORY_INDEX_POLICY).toEqual({
      canonical_name: { index: true },
      editorial_status: { index: true },
      slug: { index: true, unique: true },
    })
  })
})
