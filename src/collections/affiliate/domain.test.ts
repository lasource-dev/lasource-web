import { describe, expect, it } from 'vitest'

import { isCommercialRelationship, validateHTTPSURL } from './domain'

describe('affiliate domain', () => {
  it('n’accepte que les destinations HTTPS', () => {
    expect(validateHTTPSURL('https://example.com/resource')).toBe(true)
    expect(validateHTTPSURL('http://example.com/resource')).not.toBe(true)
    expect(validateHTTPSURL('javascript:alert(1)')).not.toBe(true)
  })

  it('distingue les recommandations commerciales des ressources indépendantes', () => {
    expect(isCommercialRelationship('affiliate')).toBe(true)
    expect(isCommercialRelationship('sponsored')).toBe(true)
    expect(isCommercialRelationship('provided_access')).toBe(true)
    expect(isCommercialRelationship('none')).toBe(false)
  })
})
