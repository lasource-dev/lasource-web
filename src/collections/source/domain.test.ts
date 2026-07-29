import { describe, expect, it } from 'vitest'

import type { Source } from '../../../payload-types'
import {
  assertValidPublishedTechnologySources,
  assertSourceCanBecomeNonPublic,
  isPublishedSource,
  normalizeSourceURL,
  prepareSourceData,
  SOURCE_INDEX_POLICY,
  validateConfidenceScore,
  validateSourceURL,
} from './domain'

const source = (overrides: Partial<Source> = {}): Source => ({
  _status: 'draft',
  archived: false,
  confidence_score: 80,
  createdAt: '2026-07-20T00:00:00.000Z',
  editorial_status: 'draft',
  id: '018f1f3d-7f1b-7a88-a91f-a22f63c596d2',
  title: 'Documentation Payload',
  type: 'documentation',
  updatedAt: '2026-07-20T00:00:00.000Z',
  url: 'https://payloadcms.com/docs',
  ...overrides,
})

describe('Source domain', () => {
  it('normalise une URL canonique et retire seulement les paramètres de suivi', () => {
    expect(
      normalizeSourceURL(
        ' HTTPS://PayloadCMS.com/docs/?page=2&utm_source=newsletter&fbclid=tracking#intro ',
      ),
    ).toBe('https://payloadcms.com/docs?page=2')
  })

  it('valide une URL HTTP et refuse les autres protocoles', () => {
    expect(validateSourceURL('https://example.com')).toBe(true)
    expect(validateSourceURL('file:///tmp/source')).not.toBe(true)
    expect(validateSourceURL('invalide')).not.toBe(true)
  })

  it('valide un score de confiance entier de 0 à 100', () => {
    expect(validateConfidenceScore(0)).toBe(true)
    expect(validateConfidenceScore(100)).toBe(true)
    expect(validateConfidenceScore(50.5)).not.toBe(true)
    expect(validateConfidenceScore(101)).not.toBe(true)
  })

  it('rend l’UUID immuable', () => {
    expect(() => prepareSourceData({ id: 'another-id' }, 'update', source())).toThrow(
      'Source id is immutable',
    )
  })

  it('exige une date de vérification pour publier une source active', () => {
    expect(() =>
      prepareSourceData({ editorial_status: 'published' }, 'update', source()),
    ).toThrow('verified_at is required')

    expect(
      prepareSourceData(
        { editorial_status: 'published', verified_at: '2026-07-20T12:00:00.000Z' },
        'update',
        source(),
      )._status,
    ).toBe('published')
  })

  it('archive une source en la retirant de la publication', () => {
    expect(
      prepareSourceData(
        { archived: true },
        'update',
        source({
          _status: 'published',
          editorial_status: 'published',
          verified_at: '2026-07-20T12:00:00.000Z',
        }),
      )._status,
    ).toBe('draft')
  })

  it('reconnaît uniquement une source publique active', () => {
    expect(
      isPublishedSource(
        source({
          _status: 'published',
          editorial_status: 'published',
          verified_at: '2026-07-20T12:00:00.000Z',
        }),
      ),
    ).toBe(true)
    expect(isPublishedSource(source())).toBe(false)
  })

  it('interdit une source non publique sur une technologie publiée', () => {
    expect(() => assertValidPublishedTechnologySources('published', [source()])).toThrow(
      'A published Technology can only reference published, active Sources',
    )
    expect(() =>
      assertValidPublishedTechnologySources('published', [
        source({
          _status: 'published',
          editorial_status: 'published',
          verified_at: '2026-07-20T12:00:00.000Z',
        }),
      ]),
    ).not.toThrow()
  })

  it('interdit de retirer une source encore utilisée par une technologie publiée', () => {
    expect(() => assertSourceCanBecomeNonPublic(1)).toThrow(
      'A Source used by a published Technology cannot be archived or unpublished',
    )
    expect(() => assertSourceCanBecomeNonPublic(0)).not.toThrow()
  })

  it('déclare seulement les index de consultation et d’intégrité utiles', () => {
    expect(SOURCE_INDEX_POLICY).toEqual({
      editorial_status: { index: true },
      type: { index: true },
      url: { index: true, unique: true },
      verified_at: { index: true },
    })
  })
})
