import config from '@payload-config'
import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

const CHANNELS = new Set(['web', 'mcp', 'newsletter'])
const SAFE_PLACEMENT = /^[a-z0-9_-]{1,80}$/
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!SAFE_SLUG.test(slug)) return new NextResponse(null, { status: 404 })

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'affiliate-offers',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'active' } }] },
  })
  const offer = result.docs[0]
  const now = new Date()
  if (
    !offer ||
    (offer.starts_at && new Date(offer.starts_at) > now) ||
    (offer.ends_at && new Date(offer.ends_at) <= now)
  ) {
    return new NextResponse(null, { status: 404 })
  }

  let destination: URL
  try {
    destination = new URL(offer.destination_url)
  } catch {
    return new NextResponse(null, { status: 404 })
  }
  if (destination.protocol !== 'https:') return new NextResponse(null, { status: 404 })

  const requestedChannel = request.nextUrl.searchParams.get('src') ?? 'web'
  const channel = CHANNELS.has(requestedChannel) ? requestedChannel : 'web'
  const requestedPlacement = request.nextUrl.searchParams.get('placement')
  const placement = requestedPlacement && SAFE_PLACEMENT.test(requestedPlacement) ? requestedPlacement : undefined
  const ref = request.nextUrl.searchParams.get('ref')

  let contentID: string | undefined
  if (ref && SAFE_SLUG.test(ref)) {
    const contents = await payload.find({
      collection: 'editorial-contents',
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { slug: { equals: ref } },
    })
    contentID = contents.docs[0]?.id
  }

  try {
    await payload.create({
      collection: 'affiliate-events',
      data: {
        channel: channel as 'web' | 'mcp' | 'newsletter',
        content: contentID,
        occurred_at: now.toISOString(),
        offer: offer.id,
        placement,
      },
      overrideAccess: true,
    })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Unable to record affiliate click' })
  }

  const response = NextResponse.redirect(destination, 302)
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}
