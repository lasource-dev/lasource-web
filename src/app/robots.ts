import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const serverURL = (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  return {
    rules: {
      allow: '/',
      disallow: ['/admin/', '/api/', '/go/', '/graphql', '/graphql-playground'],
      userAgent: '*',
    },
    sitemap: `${serverURL}/sitemap.xml`,
  }
}
