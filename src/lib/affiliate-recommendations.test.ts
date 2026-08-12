import { describe, expect, it, vi } from 'vitest'

import type { AffiliateOffer, EditorialContent } from '../../payload-types'

import { loadAffiliateSections } from './affiliate-recommendations'

const content = {
  content_type: 'tutorial',
  level: 'intermediate',
  pinned_affiliate_offers: [],
  technologies: ['langchain'],
} as unknown as EditorialContent

const offer = (overrides: Partial<AffiliateOffer>): AffiliateOffer =>
  ({
    id: 'offer',
    slug: 'offer',
    title: 'Ressource',
    partner: 'partner',
    resource_type: 'book',
    why_recommended: 'Une justification originale.',
    best_for: 'Les développeurs',
    limitations: 'Demande quelques bases.',
    selection_basis: 'researched',
    last_verified_at: '2026-08-01T00:00:00.000Z',
    commercial_relationship: 'affiliate',
    destination_url: 'https://example.com',
    cta_label: 'Voir',
    priority: 50,
    status: 'active',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  }) as AffiliateOffer

describe('affiliate recommendations', () => {
  it('écarte les offres hors sujet ou expirées et regroupe les autres par thématique', async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [
        offer({ id: 'relevant', technologies: ['langchain'] }),
        offer({ id: 'unrelated', technologies: ['react'] }),
        offer({ id: 'expired', technologies: ['langchain'], ends_at: '2026-07-01T00:00:00Z' }),
        offer({ id: 'course', resource_type: 'course', technologies: [] }),
      ],
    })

    const sections = await loadAffiliateSections(
      { find } as never,
      content,
      new Date('2026-08-12T00:00:00Z'),
    )

    expect(sections.map((section) => [section.type, section.offers.map(({ id }) => id)])).toEqual([
      ['book', ['relevant']],
      ['course', ['course']],
    ])
  })

  it('respecte une sélection éditoriale épinglée sans réactiver une offre suspendue', async () => {
    const pinnedContent = {
      ...content,
      pinned_affiliate_offers: ['second', 'first'],
    } as EditorialContent
    const find = vi.fn().mockResolvedValue({
      docs: [
        offer({ id: 'first' }),
        offer({ id: 'second' }),
        offer({ id: 'paused', status: 'paused' }),
      ],
    })

    const sections = await loadAffiliateSections({ find } as never, pinnedContent)

    expect(sections[0]?.offers.map(({ id }) => id)).toEqual(['second', 'first'])
  })
})
