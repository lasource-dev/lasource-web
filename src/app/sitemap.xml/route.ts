import { getPayload } from 'payload'

import { readServerEnvironment } from '../../lib/env'
import { GPU_PROVIDERS } from '../(frontend)/ressources/gpu/providers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const escapeXML = (value: string) =>
  value.replace(/[<>&'\"]/g, (character) => {
    const entities: Record<string, string> = {
      '"': '&quot;',
      '&': '&amp;',
      "'": '&apos;',
      '<': '&lt;',
      '>': '&gt;',
    }
    return entities[character]
  })

export async function GET() {
  const { default: config } = await import('@payload-config')
  const serverURL = readServerEnvironment().NEXT_PUBLIC_SERVER_URL
  const payload = await getPayload({ config })
  const [technologies, contents] = await Promise.all([
    payload.find({
      collection: 'technologies',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      where: { and: [{ editorial_status: { equals: 'published' } }, { _status: { equals: 'published' } }] },
    }),
    payload.find({
      collection: 'editorial-contents',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      where: { and: [{ editorial_status: { equals: 'published' } }, { _status: { equals: 'published' } }] },
    }),
  ])

  const urls: { lastModified?: string; location: string }[] = [
    ...['', '/a-propos', '/politique-affiliation', '/technologies', '/guides', '/tutoriels', '/ressources/gpu', '/ressources/gpu/fournisseurs'].map((path) => ({
      location: `${serverURL}${path}`,
    })),
    ...GPU_PROVIDERS.map((provider) => ({
      location: `${serverURL}/ressources/gpu/fournisseurs/${provider.slug}`,
    })),
    ...technologies.docs.map((technology) => ({
      lastModified: technology.updatedAt,
      location: `${serverURL}/technologies/${technology.slug}`,
    })),
    ...contents.docs.map((content) => ({
      lastModified: content.updatedAt,
      location: `${serverURL}/${content.content_type === 'guide' ? 'guides' : 'tutoriels'}/${content.slug}`,
    })),
  ]

  const entries = urls
    .map(
      ({ lastModified, location }) =>
        `<url><loc>${escapeXML(location)}</loc>${
          lastModified ? `<lastmod>${escapeXML(lastModified)}</lastmod>` : ''
        }</url>`,
    )
    .join('')
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`

  return new Response(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
