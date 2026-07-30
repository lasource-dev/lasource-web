import { describe, expect, it } from 'vitest'

import type { EditorialContent } from '../../payload-types'
import {
  buildEditorialContentMetadata,
  loadPublishedEditorialContent,
} from './editorial-content-public'

const content = (overrides: Partial<EditorialContent> = {}): EditorialContent => ({
  _status: 'published',
  body_markdown: '# Contenu',
  content_type: 'guide',
  createdAt: '2026-07-30T00:00:00.000Z',
  description: 'Un guide suffisamment détaillé pour vérifier le chargement public.',
  editorial_status: 'published',
  id: '018f1f3d-7f1b-7a88-a91f-a22f63c596d3',
  level: 'beginner',
  next_review_at: '2027-01-30T00:00:00.000Z',
  review_status: 'unreviewed',
  slug: 'comprendre-http',
  source_ids: [],
  title: 'Comprendre HTTP',
  updatedAt: '2026-07-30T00:00:00.000Z',
  ...overrides,
})

describe('public editorial content', () => {
  it('charge un guide publié même lorsqu’il attend sa relecture', async () => {
    const published = content()
    await expect(
      loadPublishedEditorialContent(published.slug, 'guide', async () => [published]),
    ).resolves.toEqual(published)
  })

  it.each([
    content({ _status: 'draft' }),
    content({ editorial_status: 'draft' }),
    content({ editorial_status: 'archived' }),
    content({ content_type: 'tutorial' }),
  ])('masque un document qui ne correspond pas à la route publique', async (hidden) => {
    await expect(
      loadPublishedEditorialContent(hidden.slug, 'guide', async () => [hidden]),
    ).resolves.toBeNull()
  })

  it('construit une URL canonique selon le type', () => {
    expect(
      buildEditorialContentMetadata(content(), 'https://lasource.dev').alternates,
    ).toEqual({ canonical: 'https://lasource.dev/guides/comprendre-http' })
    expect(
      buildEditorialContentMetadata(
        content({ content_type: 'tutorial', slug: 'premiere-page' }),
        'https://lasource.dev',
      ).alternates,
    ).toEqual({ canonical: 'https://lasource.dev/tutoriels/premiere-page' })
  })
})
