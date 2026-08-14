import { RootPage, generatePageMetadata } from '@payloadcms/next/views'

import { importMap } from '../importMap'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

export const generateMetadata = async ({ params, searchParams }: Args) => {
  const { default: config } = await import('@payload-config')
  return generatePageMetadata({ config, params, searchParams })
}

export default async function Page({ params, searchParams }: Args) {
  const { default: config } = await import('@payload-config')
  return RootPage({ config, importMap, params, searchParams })
}
