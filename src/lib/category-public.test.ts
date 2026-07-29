import { describe, expect, it } from 'vitest'

import type { Category } from '../../payload-types'
import { buildCategoryMetadata } from './category-public'

const category = (overrides: Partial<Category> = {}): Category => ({
  _status: 'published',
  archived: false,
  canonical_name: 'Framework',
  createdAt: '2026-07-20T00:00:00.000Z',
  editorial_status: 'published',
  id: '018f1f3d-7f1b-7a88-a91f-a22f63c596d2',
  short_description: 'Bibliothèque qui structure une application.',
  slug: 'framework',
  updatedAt: '2026-07-20T00:00:00.000Z',
  ...overrides,
})

describe('Category SEO', () => {
  it('privilégie les métadonnées éditoriales', () => {
    expect(
      buildCategoryMetadata(category({ meta_description: 'Description SEO', meta_title: 'Titre SEO' })),
    ).toMatchObject({ description: 'Description SEO', title: 'Titre SEO' })
  })

  it('utilise le nom canonique et la description courte en fallback', () => {
    expect(buildCategoryMetadata(category({ meta_description: ' ', meta_title: ' ' }))).toMatchObject({
      description: 'Bibliothèque qui structure une application.',
      title: 'Framework',
    })
  })
})
