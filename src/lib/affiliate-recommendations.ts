import type { Payload } from 'payload'

import type { AffiliateOffer, EditorialContent } from '../../payload-types'

import {
  AFFILIATE_RESOURCE_TYPES,
  type AffiliateResourceType,
} from '../collections/affiliate/domain'

export type AffiliateSection = {
  offers: AffiliateOffer[]
  type: AffiliateResourceType
}

const relationshipID = (value: string | { id: string }) =>
  typeof value === 'object' ? String(value.id) : String(value)

const isCurrentlyAvailable = (offer: AffiliateOffer, now: Date) => {
  const timestamp = now.getTime()
  return (
    offer.status === 'active' &&
    (!offer.starts_at || new Date(offer.starts_at).getTime() <= timestamp) &&
    (!offer.ends_at || new Date(offer.ends_at).getTime() > timestamp)
  )
}

const matchesContent = (offer: AffiliateOffer, content: EditorialContent) => {
  const contentTechnologyIDs = new Set((content.technologies ?? []).map(relationshipID))
  const targetedTechnologyIDs = (offer.technologies ?? []).map(relationshipID)
  const technologyMatches =
    targetedTechnologyIDs.length === 0 ||
    targetedTechnologyIDs.some((id) => contentTechnologyIDs.has(id))
  const typeMatches =
    !offer.content_types?.length || offer.content_types.includes(content.content_type)
  const levelMatches =
    !offer.levels?.length || offer.levels.includes(content.level) || offer.levels.includes('all')

  return technologyMatches && typeMatches && levelMatches
}

const relevanceScore = (offer: AffiliateOffer, content: EditorialContent) => {
  const contentTechnologyIDs = new Set((content.technologies ?? []).map(relationshipID))
  const technologyMatches = (offer.technologies ?? []).filter((technology) =>
    contentTechnologyIDs.has(relationshipID(technology)),
  ).length
  const typeBonus = offer.content_types?.includes(content.content_type) ? 15 : 0
  const levelBonus = offer.levels?.includes(content.level) ? 10 : 0
  return offer.priority + technologyMatches * 30 + typeBonus + levelBonus
}

const populatedOfferIDs = (values: EditorialContent['pinned_affiliate_offers']) =>
  values?.map(relationshipID) ?? []

export async function loadAffiliateSections(
  payload: Payload,
  content: EditorialContent,
  now = new Date(),
): Promise<AffiliateSection[]> {
  const pinnedIDs = populatedOfferIDs(content.pinned_affiliate_offers)
  const result = await payload.find({
    collection: 'affiliate-offers',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    where: pinnedIDs.length
      ? { and: [{ id: { in: pinnedIDs } }, { status: { equals: 'active' } }] }
      : { status: { equals: 'active' } },
  })

  const pinnedOrder = new Map(pinnedIDs.map((id, index) => [id, index]))
  const eligible = result.docs
    .filter((offer) => isCurrentlyAvailable(offer, now))
    .filter((offer) => pinnedIDs.length > 0 || matchesContent(offer, content))
    .sort((left, right) => {
      if (pinnedIDs.length) {
        return (pinnedOrder.get(String(left.id)) ?? 999) - (pinnedOrder.get(String(right.id)) ?? 999)
      }
      return relevanceScore(right, content) - relevanceScore(left, content)
    })

  const sections = AFFILIATE_RESOURCE_TYPES.map((type) => ({
    offers: eligible.filter((offer) => offer.resource_type === type).slice(0, 2),
    type,
  })).filter((section) => section.offers.length > 0)

  return sections.slice(0, 3)
}
