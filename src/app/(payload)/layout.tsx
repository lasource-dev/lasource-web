import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import type { ReactNode } from 'react'

import { importMap } from './admin/importMap'

export const dynamic = 'force-dynamic'

type Args = { children: ReactNode }

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  const { default: config } = await import('@payload-config')
  return handleServerFunctions({ ...args, config, importMap })
}

export default async function PayloadLayout({ children }: Args) {
  const { default: config } = await import('@payload-config')
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
