import { describe, expect, it } from 'vitest'

import type { Technology } from '../../payload-types'
import { buildTechnologyMetadata, loadPublishedTechnology } from './technology-public'

const technology = (overrides: Partial<Technology> = {}): Technology => ({
  _status: 'published',
  canonical_name: 'Model Context Protocol',
  category: 'Protocole',
  createdAt: '2026-07-20T00:00:00.000Z',
  editorial_status: 'published',
  freshness_status: 'fresh',
  id: '018f1f3d-7f1b-7a88-a91f-a22f63c596d1',
  short_description: "Un protocole ouvert pour connecter des applications d'IA à leur contexte.",
  slug: 'model-context-protocol',
  updatedAt: '2026-07-20T00:00:00.000Z',
  verified_at: '2026-07-20T00:00:00.000Z',
  ...overrides,
})

describe('public Technology resource', () => {
  it('lit une technologie publiée', async () => {
    const published = technology()
    await expect(
      loadPublishedTechnology(published.slug, async () => [published]),
    ).resolves.toEqual(published)
  })

  it.each([
    technology({ _status: 'draft' }),
    technology({ editorial_status: 'draft' }),
    technology({ editorial_status: 'archived' }),
  ])('retourne null pour un contenu non publié ou archivé', async (hidden) => {
    await expect(loadPublishedTechnology(hidden.slug, async () => [hidden])).resolves.toBeNull()
  })

  it('retourne null pour un slug inconnu', async () => {
    await expect(loadPublishedTechnology('inconnu', async () => [])).resolves.toBeNull()
  })

  it('utilise les métadonnées éditoriales en priorité', () => {
    const metadata = buildTechnologyMetadata(
      technology({ meta_description: 'Description SEO', meta_title: 'Titre SEO' }),
      'https://lasource.dev',
    )

    expect(metadata).toMatchObject({
      alternates: { canonical: 'https://lasource.dev/technologies/model-context-protocol' },
      description: 'Description SEO',
      title: 'Titre SEO',
    })
  })

  it('applique le fallback SEO sans dupliquer les valeurs', () => {
    const current = technology()
    const metadata = buildTechnologyMetadata(current, 'https://lasource.dev')

    expect(metadata.title).toBe(current.canonical_name)
    expect(metadata.description).toBe(current.short_description)
    expect(metadata.openGraph).toMatchObject({
      description: current.short_description,
      title: current.canonical_name,
    })
  })
})
