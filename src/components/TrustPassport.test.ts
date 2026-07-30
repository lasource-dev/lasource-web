import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  buildTrustPassportDetails,
  getValidationLabel,
  TrustPassport,
} from './TrustPassport'

describe('TrustPassport', () => {
  it('affiche les données disponibles sans indice numérique de confiance', () => {
    const markup = renderToStaticMarkup(
      createElement(TrustPassport, {
        data: {
          editorialStatus: 'expert_validated',
          examplesTested: true,
          expertValidator: 'Camille Martin',
          lastUpdated: '2026-07-29T00:00:00.000Z',
          license: 'Citation courte avec attribution',
          revisionCount: 4,
          sourceCount: 3,
          technologyVersion: '16.2',
          validationLevel: 'expert',
        },
      }),
    )

    expect(markup).toContain('Passeport de confiance')
    expect(markup).toContain('Validation experte')
    expect(markup).toContain('Camille Martin')
    expect(markup).toContain('3 sources')
    expect(markup).toContain('Exemples testés')
    expect(markup).not.toContain('score')
    expect(markup).not.toContain('indice')
  })

  it('omet les champs absents', () => {
    expect(
      buildTrustPassportDetails({
        editorialStatus: 'draft',
      }),
    ).toEqual([])
  })

  it('ne présente pas une validation experte sans expert identifié', () => {
    expect(getValidationLabel('expert', undefined)).toBe('Validation éditoriale')

    const markup = renderToStaticMarkup(
      createElement(TrustPassport, {
        data: {
          editorialStatus: 'editorially_validated',
          validationLevel: 'expert',
        },
      }),
    )

    expect(markup).toContain('Validation éditoriale')
    expect(markup).not.toContain('Validateur expert')
  })

  it('rend explicitement le résultat des tests d’exemples', () => {
    const details = buildTrustPassportDetails({
      editorialStatus: 'in_review',
      examplesTested: false,
      sourceCount: 0,
    })

    expect(details).toContainEqual({ label: 'Exemples testés', value: 'Non' })
    expect(details).toContainEqual({ label: 'Sources', value: '0 sources' })
  })
})
