import { NotFoundPage } from '@payloadcms/next/views'

import { importMap } from '../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

export default async function NotFound({ params, searchParams }: Args) {
  const { default: config } = await import('@payload-config')
  return NotFoundPage({ config, importMap, params, searchParams })
}
