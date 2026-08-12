export const AFFILIATE_RESOURCE_TYPES = [
  'book',
  'course',
  'developer_tool',
  'cloud',
  'hosting',
  'monitoring',
  'certification',
  'free_resource',
] as const

export type AffiliateResourceType = (typeof AFFILIATE_RESOURCE_TYPES)[number]

export const AFFILIATE_SECTION_LABELS: Record<AffiliateResourceType, string> = {
  book: 'Les livres pour approfondir ce sujet',
  course: 'Les formations pour approfondir ce sujet',
  developer_tool: 'Les outils pour passer à la pratique',
  cloud: 'Les solutions cloud adaptées à ce sujet',
  hosting: 'Les solutions pour héberger votre projet',
  monitoring: 'Les outils pour superviser votre projet',
  certification: 'Les certifications associées',
  free_resource: 'Les ressources gratuites pour aller plus loin',
}

export const AFFILIATE_RELATIONSHIPS = [
  'none',
  'affiliate',
  'sponsored',
  'provided_access',
] as const

export const validateHTTPSURL = (value: string | null | undefined): true | string => {
  if (!value) return 'Une URL de destination est obligatoire.'
  try {
    return new URL(value).protocol === 'https:' ? true : 'Utilisez une URL HTTPS.'
  } catch {
    return 'Utilisez une URL HTTPS absolue valide.'
  }
}

export const isCommercialRelationship = (relationship: string | null | undefined) =>
  relationship === 'affiliate' || relationship === 'sponsored' || relationship === 'provided_access'
